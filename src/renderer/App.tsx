import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Content, Main, usePageLayoutResize } from "@atlaskit/page-layout"
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs"
import styled from "styled-components"
import { isEmpty, noop } from "lodash"
import { AxisOptions, Chart } from "react-charts"
import { Throughput } from "src/main/dataManiuplation"
import { filter, first, get, last, pipe, toString } from "lodash/fp"
import AdoConfiguration from "./configuration/AdoConfiguration"
import NumericInput from "./FormFields/NumericInput"
import RadioField from "./FormFields/RadioGroupField"
import {
  Field,
  FieldsType,
  FieldType,
  Form,
  useForm,
  useValidationRule,
} from "./Form"
import Button from "@atlaskit/button"
import FilePicker from "./FormFields/FilePicker"
import RadioGroupField from "./FormFields/RadioGroupField"
import TextField from "./FormFields/TextField"
import { ChangeType, ValidationOutputType } from "./Form/useValidationRule"

const NavBorder = styled.div`
  --ds-surface: var(--side-bar-color);
  height: 100vh;
  border-right: 1px solid var(--border-color);
`

const NavLayout = styled.div`
  height: 100% !important;
  flex-direction: column;
  display: flex;
  background: var(--side-bar-color);
  > *,
  > * > *,
  > * > * > * {
    display: flex;
    flex-direction: column;
    flex: 1;
  }
  > *:last-child {
    flex: 1;
  }
  padding: 0 4px 24px;

  > *::after,
  > * *::after {
    content: none !important;
  }
`

const Panel = styled.div`
  margin-top: 8px;
  padding: 16px 0;
  width: 100%;
  flex: 1;
  display: flex;
`

const MainContent = styled.div`
  padding: 40px;
`

const FlexContainer = styled.div<{ direction?: "row" | "column" }>`
  display: flex;
  flex: 1;
  width: 100%;
  flex-direction: ${({ direction }) => direction ?? "column"};
`

const Flex = styled.div<{ flex: number }>`
  flex: ${({ flex }) => flex};
  margin: 24px;
  align-self: center;
`

const Bordered = styled.div`
  padding: 0 24px;
  border: 4px solid var(--border-color);
`

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`

const Heading = styled.h1`
  margin-bottom: 0;
`

const Hr = styled.hr`
  width: 100%;
  flex: 1;
`

const getAnswer = (
  confidenceLevel: number,
): ((dataSet: number[][]) => number) =>
  pipe(
    filter(
      ([numberOfItems, probability]) =>
        Math.round(probability) <= confidenceLevel &&
        Math.round(probability) > 0,
    ),
    first,
    get(0),
  )

const App = () => {
  const [dataSets, setDataSets] = useState<{
    throughput: Throughput
    distribution: [][]
    forecast: number[][]
  }>({ throughput: [], distribution: [], forecast: [] })
  const [confidenceLevel, setConfidenceLevel] = useState(85)
  const handleConfidenceLevelChange = useCallback(
    (evt, newValue: number) => {
      setConfidenceLevel(newValue)
    },
    [dataSets.forecast],
  )

  const { collapseLeftSidebar, expandLeftSidebar } = usePageLayoutResize()

  const handleFormSubmision = useCallback((evt, form) => {
    if (!!form.fields.filePath) {
      electron
        .openCsvDataSource(form.fields.filePath.value)
        .then(([results, throughput, distribution, forecast]) => {
          setDataSets({ throughput, distribution, forecast })
        })
    } else {
      electron
        .openAdoDataSource(
          {
            organizationName: form.fields.orgName.value,
            projectName: form.fields.projectName.value,
            accessToken: form.fields.adoPat.value,
            username: form.fields.adoUsername.value,
          },
          { teamMemberIds: form.fields.teamMemberIds.value.map(get("value")) },
        )
        .then(([results, throughput, distribution, forecast]) => {
          setDataSets({ throughput, distribution, forecast })
        })
    }
  }, [])

  useEffect(() => {
    if (isEmpty(dataSets.throughput)) {
      expandLeftSidebar()
    }
  }, [dataSets])
  useEffect(() => {
    if (!isEmpty(dataSets.throughput)) {
      collapseLeftSidebar()
    }
  }, [dataSets])

  const [answer, setAnswer] = useState<number | null>(null)
  useEffect(() => {
    setAnswer(getAnswer(confidenceLevel)(dataSets.forecast))
  }, [dataSets.forecast, confidenceLevel])

  const throughputPrimaryAxis = useMemo(
    (): AxisOptions<{ date: Date; count: number }> => ({
      getValue: (datum) => datum.date,
    }),
    [],
  )
  const throughputSecondaryAxes = useMemo(
    (): AxisOptions<{ date: Date; count: number }>[] => [
      {
        getValue: (datum) => datum.count,
      },
    ],
    [],
  )

  const distributionPrimaryAxis = useMemo(
    (): AxisOptions<[]> => ({
      getValue: pipe(get(0), toString),
    }),
    [],
  )
  const distributionSecondaryAxes = useMemo(
    (): AxisOptions<[]>[] => [
      {
        getValue: get(1),
      },
    ],
    [],
  )

  const forecastingPrimaryAxis = useMemo(
    (): AxisOptions<[]> => ({
      getValue: pipe(get(0), toString),
    }),
    [],
  )
  const forecastingSecondaryAxes = useMemo(
    (): AxisOptions<[]>[] => [
      {
        getValue: get(1),
      },
    ],
    [],
  )

  const [submit, reset, form] = useForm("configuration")
  const [currentTabIndex, setCurrentTabIndex] = useState(0)
  const handleTabChange = useCallback((index) => {
    setCurrentTabIndex(index)
  }, [])
  useEffect(() => {
    form.revalidate()
  }, [currentTabIndex])

  const validateRequired = useValidationRule<string>(
    "Required",
    (field, fields) => field.value != "",
    "any",
  )
  const validateAdoRequired = useValidationRule<string>(
    "Required",
    (field, fields) => currentTabIndex !== 1 || field.value != "",
    "any",
  )
  const validateCsvRequired = useValidationRule<string>(
    "Required",
    (field, fields) => currentTabIndex !== 0 || field.value != "",
    "any",
  )

  return (
    <Content>
      <Main>
        <MainContent>
          <Heading>Work Forecasting Tool</Heading>
          <FlexContainer direction="row">
            <Form
              id={"configuration"}
              onSubmit={handleFormSubmision}
              onReset={noop}
            >
              <FlexContainer direction="column">
                <section>
                  <Field
                    fullWidth
                    as={(props) => (
                      <RadioGroupField
                        options={[
                          {
                            label:
                              "How many work items can be completed in a time frame?",
                            value: "howMany",
                          },
                          {
                            label:
                              "How long will some number of work items take to complete?",
                            value: "howLong",
                          },
                        ]}
                        {...props}
                      />
                    )}
                    defaultValue=""
                    label="Forecasting Type"
                    name="forecastType"
                    onBlur={noop}
                    validate={validateRequired}
                  />
                </section>
                <section>
                  <Heading as="h3">Data Source</Heading>
                  <Tabs id="dataSourceTabs" onChange={handleTabChange}>
                    <TabList>
                      <Tab>CSV</Tab>
                      <Tab>ADO</Tab>
                    </TabList>
                    <TabPanel>
                      <Panel>
                        <Field<string, { accept: string }>
                          fullWidth
                          accept="text/csv"
                          as={FilePicker}
                          defaultValue=""
                          label="CSV File"
                          name="filePath"
                          validate={validateCsvRequired}
                        />
                      </Panel>
                    </TabPanel>
                    <TabPanel>
                      <Panel>
                        <Field
                          fullWidth
                          as={TextField}
                          defaultValue=""
                          label="Organization Name"
                          name="orgName"
                          onBlur={noop}
                          validate={validateAdoRequired}
                        />
                      </Panel>
                    </TabPanel>
                  </Tabs>
                </section>
                <Hr />
                <section>
                  <Button
                    appearance="primary"
                    isDisabled={!form.canSubmit}
                    onClick={submit}
                  >
                    Start
                  </Button>
                </section>
              </FlexContainer>
            </Form>
            <FlexContainer direction="column">
              {!isEmpty(dataSets.throughput) &&
                !isEmpty(dataSets.distribution) &&
                !isEmpty(dataSets.forecast) && (
                  <>
                    <Bordered>
                      <Heading as="h2">90 day Forecast</Heading>
                      <FlexContainer>
                        <Flex flex={1}>
                          <label>
                            Target Confidence Level:
                            <NumericInput
                              onBlur={noop}
                              onChange={handleConfidenceLevelChange}
                              value={confidenceLevel}
                            />
                          </label>
                        </Flex>
                        <Flex flex={3}>
                          Answer: <strong>{answer} work items</strong>
                        </Flex>
                      </FlexContainer>
                    </Bordered>
                    <hr />
                    <Heading as="h3">Throughput by Week</Heading>
                    <ChartContainer data-test="WeeklyThroughputChart">
                      <Chart
                        options={{
                          data: [
                            {
                              label: "Weekly Throughput",
                              data: dataSets.throughput,
                            },
                          ],
                          dark: true,
                          primaryAxis: throughputPrimaryAxis,
                          secondaryAxes: throughputSecondaryAxes,
                        }}
                      />
                    </ChartContainer>
                    <Heading as="h3">90 day Forecast Distribution</Heading>
                    <ChartContainer>
                      <Chart
                        options={{
                          data: [
                            {
                              label: "90 day Forecast Distribution",
                              data: dataSets.distribution,
                            },
                          ],

                          dark: true,
                          primaryAxis: distributionPrimaryAxis,
                          secondaryAxes: distributionSecondaryAxes,
                        }}
                      />
                    </ChartContainer>
                    <ChartContainer>
                      <Heading as="h3">90 day Delivery Confidence</Heading>
                      <Chart
                        options={{
                          data: [
                            {
                              label: "90 day Forecast",
                              data: dataSets.forecast,
                            },
                          ],

                          dark: true,
                          primaryAxis: forecastingPrimaryAxis,
                          secondaryAxes: forecastingSecondaryAxes,
                        }}
                      />
                    </ChartContainer>
                  </>
                )}
            </FlexContainer>
          </FlexContainer>
        </MainContent>
      </Main>
    </Content>
  )
}

export default App
