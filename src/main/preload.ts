import { contextBridge, ipcRenderer } from "electron"
console.log("preloaded!")

contextBridge.exposeInMainWorld("electron", {
  openCsvFile: () =>
    ipcRenderer.invoke("dialog", "showOpenDialog", {
      title: "Select throughput CSV file",
      buttonLabel: "Select",
      filters: [
        {
          name: "Comma Separated Files",
          extensions: ["csv"],
        },
      ],
      properties: ["openFile"],
    }),
})
