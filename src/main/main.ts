import fs from "fs"
import path from "path"
import { parseStream } from "fast-csv"
import { format } from "url"
import { app, BrowserWindow, ipcMain, session } from "electron"
import { is } from "electron-util"
import { searchDevtools } from "electron-search-devtools"
import { createForecastFromDistribution, createSimulationDistribution, getThroughputByDay, getThroughputByWeek, getWorkItemClosedDates } from "./dataManiuplation"
import { pipe, } from "lodash/fp"

let win: BrowserWindow | null = null

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

  ipcMain.handle("cvsFileDataSet", async (event, { filePath }: { filePath: string }) => {
    const fileStream = fs.createReadStream(filePath)
    const options = {
      objectMode: true,
      delimiter: ",",
      quote: '"',
      headers: true,
      renameHeaders: false,
    }
    const [count, rows] = await new Promise((resolve) => {
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
    const throughputByWeek = pipe(getWorkItemClosedDates, getThroughputByWeek)(rows)
    const distribution = pipe(getWorkItemClosedDates, getThroughputByDay, createSimulationDistribution(12000, 90))(rows)
    const forecast = createForecastFromDistribution(distribution)

    return [{ count, rows }, throughputByWeek, distribution, forecast]
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
