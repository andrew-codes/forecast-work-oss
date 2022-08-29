import { contextBridge, ipcRenderer } from "electron"
console.log("preloaded!")

contextBridge.exposeInMainWorld("electron", {
  openCsvFile: (filePath: string) =>
    ipcRenderer.invoke("cvsFileDataSet", { filePath }),
})
