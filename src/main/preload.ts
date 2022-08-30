import { contextBridge, ipcRenderer } from "electron"
console.log("preloaded!")

type AdoConnection = {
  organizationName: string
  projectName: string
  accessToken: string
}
type AdoQueryValues = {
  teamMemberIds: string[]
}

contextBridge.exposeInMainWorld("electron", {
  openCsvDataSource: (filePath: string) =>
    ipcRenderer.invoke("cvsFileDataSet", { filePath }),
  openAdoDataSource: (connection: AdoConnection, queryValues: AdoQueryValues) => ipcRenderer.invoke('adoDataSource', { connection, queryValues })
})
