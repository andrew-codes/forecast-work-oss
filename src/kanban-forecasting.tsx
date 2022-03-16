import * as React from "react"
import { render } from "react-dom"
import Forecasting from "./containers/forecasting"
import Vss from "./vss/Vss"

declare global {
  interface Window {
    renderApp: () => void
  }
}
window.renderApp = () => {
  window.VSS.require(["TFS/Dashboards/WidgetHelpers"], (WidgetHelpers) => {
    window.VSS.register("KanbanForecasting", () => {
      return {
        load: (widgetSettings) => {
          const root = document.querySelector("#root")
          render(
            <Vss>
              <Forecasting />
            </Vss>,
            root,
          )

          return WidgetHelpers.WidgetStatusHelper.Success()
        },
      }
    })
    window.VSS.notifyLoadSucceeded()
  })
}

window.VSS.init({
  explicitNotifyLoaded: true,
  usePlatformStyles: true,
})
window.renderApp()
