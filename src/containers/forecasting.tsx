import { CommonMethods2_1To5 } from "TFS/WorkItemTracking/RestClient"
import * as React from "react"

const Forecasting: React.FC<{
  apiClient: CommonMethods2_1To5
  projectId: string
  widgetHelpers: {
    WidgetStatusHelper: {
      Success: () => void
      Failure: (message: string) => void
    }
  }
  widgetSettings: any
}> = ({ apiClient, projectId, widgetHelpers, widgetSettings }) => {
  const configValues = JSON.parse(widgetSettings.customSettings.data ?? "{}")
  console.log("Config values", configValues)

  return <div>Hello world!</div>
}

export default Forecasting
