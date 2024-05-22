import { contextBridge, ipcRenderer } from "electron"
import { AdoConnection, AdoQueryValues } from "./AdoDataSourceTypes"
console.log("preloaded!")

contextBridge.exposeInMainWorld("electron", {
  openCsvDataSource: (filePath: string) =>
    ipcRenderer.invoke("cvsFileDataSet", { filePath }),
  openAdoDataSource: (connection: AdoConnection, queryValues: AdoQueryValues) =>
    ipcRenderer.invoke("adoDataSource", { connection, queryValues }),
  fetchAdoUsers: (connection: AdoConnection & { teamId: string }) =>
    ipcRenderer.invoke("fetchAdoUsers", connection),
  howMany: (numberOfDays: number) =>
    ipcRenderer.invoke("howMany", numberOfDays),
})
