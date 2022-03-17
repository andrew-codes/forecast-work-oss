import * as React from "react"
import { merge } from "lodash"
import { render } from "react-dom"
import { CommonMethods2_1To5 } from "TFS/WorkItemTracking/RestClient"
import ForecastingConfiguration from "./containers/ForecastingConfiguration"

declare global {
  interface Window {
    VSS
  }
}

window.VSS.init({
  explicitNotifyLoaded: true,
  usePlatformStyles: true,
})
window.VSS.require(
  ["TFS/Dashboards/WidgetHelpers", "TFS/WorkItemTracking/RestClient"],
  (WidgetHelpers, workItemTrackingApi) => {
    const projectId = window.VSS.getWebContext().project.id
    const apiClient: CommonMethods2_1To5 = workItemTrackingApi.getClient()
    let configurationValues = {}

    window.VSS.register("KanbanForecasting.Configuration", () => {
      return {
        load: (widgetSettings) => {
          console.log("here")
          const root = document.querySelector("#root")
          render(
            <ForecastingConfiguration
              apiClient={apiClient}
              onChange={(evt, field) => {
                console.log(evt, field)
                configurationValues = merge({}, configurationValues, {
                  [field.fieldName]: field.value,
                })
              }}
              projectId={projectId}
              widgetHelpers={WidgetHelpers}
              widgetSettings={widgetSettings}
            />,
            root,
          )

          return WidgetHelpers.WidgetStatusHelper.Success()
        },
        onSave: () => {
          const customSettings = {
            data: JSON.stringify(configurationValues),
          }
          // const eventName = WidgetHelpers.WidgetEvent.ConfigurationChange
          // const eventArgs = WidgetHelpers.WidgetEvent.Args(customSettings)
          // widgetConfigurationContext.notify(eventName, eventArgs)
          return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings)
        },
      }
    })
    window.VSS.notifyLoadSucceeded()
  },
)
