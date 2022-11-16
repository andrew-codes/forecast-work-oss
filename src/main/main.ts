import fs from "fs"
import path from "path"
import { parseStream } from "fast-csv"
import { format } from "url"
import { app, BrowserWindow, ipcMain, session } from "electron"
import { is } from "electron-util"
import { searchDevtools } from "electron-search-devtools"
import fetch from "node-fetch"
import {
  createForecastFromDistribution,
  createSimulationDistribution,
  fetchWorkItemDetails,
  getThroughputByDay,
  getThroughputByWeek,
  getWorkItemClosedDates,
} from "./dataManiuplation"
import { get, map, pick, pipe, reduce } from "lodash/fp"
import { AdoConnection, AdoQueryValues } from "./AdoDataSourceTypes"

let win: BrowserWindow | null = null

const throughputPerWeek = pipe(getWorkItemClosedDates, getThroughputByWeek)

const createDistributionForNumberofDays = (numberOfDays: number) =>
  pipe(
    getWorkItemClosedDates,
    getThroughputByDay,
    createSimulationDistribution(12000, numberOfDays),
  )

let dataSet: { count: number; rows: any[]; throughput: any }

async function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 820,
    minHeight: 600,
    minWidth: 650,
    webPreferences: {
      nodeIntegration: true,
      preload: path.join(__dirname, "preload.js"),
    },
    show: false,
  })

  const isDev = is.development
  if (isDev) {
    // this is the default port electron-esbuild is using
    win.loadURL("http://localhost:9080")
  } else {
    win.loadURL(
      format({
        pathname: path.join(__dirname, "..", "renderer", "index.html"),
        protocol: "file",
        slashes: true,
      }),
    )
  }

  ipcMain.handle(
    "cvsFileDataSet",
    async (event, { filePath }: { filePath: string }) => {
      const fileStream = fs.createReadStream(filePath)
      const options = {
        objectMode: true,
        delimiter: ",",
        quote: '"',
        headers: true,
        renameHeaders: false,
      }
      const [count, rows]: number[] = await new Promise((resolve) => {
        const data = []
        parseStream(fileStream, options)
          .on("error", (error) => {
            console.log(error)
          })
          .on("data", (row) => {
            data.push(row)
          })
          .on("end", (rowCount) => {
            resolve([rowCount, data])
          })
      })
      const throughput = throughputPerWeek(rows)
      const dist = distributionForNinetyDays(rows)
      const forecast = createForecastFromDistribution(dist)
      dataSet = { count, rows, throughput }
    },
  )

  ipcMain.handle(
    "fetchAdoUsers",
    async (event, connection: AdoConnection & { teamId: string }) => {
      const response = await fetch(
        new URL(
          `https://dev.azure.com/${connection.organizationName}/_apis/projects/${connection.projectName}/teams/${connection.teamId}/members?api-version=6.0-preview.1`,
        ),
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${btoa(
              `${connection.username}:${connection.accessToken}`,
            )}`,
          },
        },
      )
      const results = await response.json()
      return pipe(
        get("value"),
        map(pick(["displayName", "uniqueName"])),
        map((result: { displayName: string; uniqueName: string }) => ({
          displayName: result.displayName,
          id: result.uniqueName,
        })),
      )(results)
    },
  )

  ipcMain.handle(
    "adoDataSource",
    async (
      event,
      {
        connection,
        queryValues,
      }: { connection: AdoConnection; queryValues: AdoQueryValues },
    ) => {
      const wiqlUrl = new URL(
        `${connection.organizationName}/${connection.projectName}/_apis/wit/wiql?api-version=6.0`,
        "https://dev.azure.com/",
      )
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(
          `${connection.username}:${connection.accessToken}`,
        ).toString("base64")}`,
      }
      const teamMemberIds = queryValues.teamMemberIds
        .map((id) => `'${id}'`)
        .join(",")
      const query = `Select [System.Id], [Microsoft.VSTS.Common.ClosedDate] From WorkItems Where [System.WorkItemType] IN ('User Story','Bug') AND [State] = 'Closed' AND [Microsoft.VSTS.Common.ClosedDate] >= @StartOfDay('-180d') AND [Microsoft.VSTS.Common.ClosedBy] IN (${teamMemberIds})`
      const response = await fetch(wiqlUrl.toString(), {
        method: "POST",
        headers,
        body: JSON.stringify({ query }),
      })
      const { workItems } = (await response.json()) as { workItems: any[] }
      const workitemReponses = await Promise.all(
        fetchWorkItemDetails(
          new URL(
            `${connection.organizationName}/${connection.projectName}/_apis/wit/workitemsbatch?api-version=6.0`,
            "https://dev.azure.com/",
          ),
          headers,
        )(workItems),
      )
      const hydratedWorkItemReponses = await Promise.all(
        workitemReponses.map((response) => response.json()),
      )
      const hydratedWorkItems = pipe(
        map(get("value")),
        reduce((acc, workitems) => acc.concat(workitems), []),
      )(hydratedWorkItemReponses)

      const mapToFieldsOnly = pipe(map(get("fields")))
      const throughput = pipe(
        mapToFieldsOnly,
        throughputPerWeek,
      )(hydratedWorkItems)
      const dist = pipe(
        mapToFieldsOnly,
        distributionForNinetyDays,
      )(hydratedWorkItems)

      dataSet = {
        count: hydratedWorkItems.length,
        rows: hydratedWorkItems,
        throughput,
      }
    },
  )

  ipcMain.handle("howMany", async (event, numberOfDays: number) => {
    console.log(numberOfDays)
    const distributionForNDays = createDistributionForNumberofDays(numberOfDays)
    const dist = distributionForNDays(dataSet.rows)
    const forecast = createForecastFromDistribution(dist)
    return [
      { count: dataSet.count, rows: dataSet.rows },
      dataSet.throughput,
      dist,
      forecast,
    ]
  })

  win.on("closed", () => {
    win = null
  })

  win.webContents.on("devtools-opened", () => {
    win!.focus()
  })

  win.on("ready-to-show", () => {
    win!.show()
    win!.focus()

    if (!isDev) {
      win!.removeMenu()
    }

    if (isDev) {
      searchDevtools("REACT").then((devtools) => {
        console.log(devtools)
        session.defaultSession.loadExtension(devtools, {
          allowFileAccess: true,
        })
      })
      searchDevtools("REDUX").then((devtools) => {
        session.defaultSession.loadExtension(devtools, {
          allowFileAccess: true,
        })
      })
      win!.webContents.openDevTools()
    }
  })
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (!is.macos) {
    app.quit()
  }
})

app.on("activate", () => {
  if (win === null && app.isReady()) {
    createWindow()
  }
})
