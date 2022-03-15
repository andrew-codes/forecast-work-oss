import * as React from "react"
import context from "./context"

declare global {
  interface Window {
    VSS: any
  }
}

window.VSS = window.VSS || {}

const Vss = ({ children }) => (
  <context.Provider value={window.VSS}>{children}</context.Provider>
)

export default Vss
