import * as React from "react"
import { DefaultButton, Stack, TextField } from "@fluentui/react"
import { CommonMethods2_1To5 } from "TFS/WorkItemTracking/RestClient"

const defaultConfiguration = {
  query: "",
}

const ForecastingConfiguration: React.FC<{
  apiClient: CommonMethods2_1To5
  onChange: (
    evt: React.SyntheticEvent,
    { fieldName: string, value: any },
  ) => void
  projectId: string
  widgetHelpers: {
    WidgetStatusHelper: {
      Success: () => void
      Failure: (message: string) => void
    }
  }
  widgetSettings: any
}> = ({ apiClient, onChange, projectId, widgetHelpers, widgetSettings }) => {
  const configuration = JSON.parse(
    widgetSettings.customSettings?.data ?? defaultConfiguration,
  )

  const [query, setQuery] = React.useState(configuration.query)
  const handleSetQuery = React.useCallback((evt, newValue) => {
    onChange(evt, { fieldName: "query", value: newValue })
    setQuery(newValue)
  }, [])

  const [workItems, setWorkItems] = React.useState([])
  const handleQuery = React.useCallback(
    (evt) => {
      apiClient.queryByWiql({ query }, projectId).then(
        (workItems) => {
          setWorkItems(workItems.workItems)
        },
        (error) => {
          console.error(error)
        },
      )
    },
    [
      apiClient,
      projectId,
      widgetHelpers.WidgetStatusHelper.Success,
      widgetHelpers.WidgetStatusHelper.Failure,
    ],
  )

  console.log("work items", workItems)

  return (
    <Stack tokens={{ childrenGap: 15 }}>
      <TextField
        multiline
        required
        defaultValue={query}
        label="Query"
        rows={3}
        onChange={handleSetQuery}
      />
      <DefaultButton
        disabled={query === ""}
        onClick={handleQuery}
        text="Fetch Work Items"
      />
    </Stack>
  )
}

export default ForecastingConfiguration
