import React, { useCallback, useEffect, useMemo, useState } from "react"
import { Content, Main, usePageLayoutResize } from "@atlaskit/page-layout"
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs"
import styled from "styled-components"
import { isEmpty, noop } from "lodash"
import { AxisOptions, Chart } from "react-charts"
import { Throughput } from "src/main/dataManiuplation"
import { filter, first, get, last, pipe, toString } from "lodash/fp"
import NumericInput from "./FormFields/NumericInput"
import { Field, Form, useForm, useValidationRule, ValidityType } from "./Form"
import Button from "@atlaskit/button"
import FilePicker from "./FormFields/FilePicker"
import RadioGroupField from "./FormFields/RadioGroupField"
import TextField from "./FormFields/TextField"
import PasswordField from "./FormFields/PasswordField"
import SelectField from "./FormFields/SelectField"
import VerticalSpacedGroup from "./VerticalSpacedGroup"

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
  margin: 0 8px;
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
    let loadDataSource
    if (!!form.fields.filePath.value) {
      loadDataSource = electron.openCsvDataSource(form.fields.filePath.value)
    } else {
      loadDataSource = electron.openAdoDataSource(
        {
          organizationName: form.fields.orgName.value,
          projectName: form.fields.projectName.value,
          accessToken: form.fields.adoPat.value,
          username: form.fields.adoUsername.value,
        },
        { teamMemberIds: form.fields.teamMemberIds.value.map(get("value")) },
      )
    }
    loadDataSource
      .then(() => electron.howMany(form.fields.numberOfDays.value))
      .then(([results, throughput, distribution, forecast]) => {
        setDataSets({ throughput, distribution, forecast })
      })
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
  const validateTeamMembers = useValidationRule<
    { label: string; value: string }[]
  >("Two or more team members are required", (field, fields) => {
    return (
      currentTabIndex !== 1 ||
      (field.value.length > 1 &&
        field.value.reduce((acc, option) => acc && option.value !== "", true))
    )
  })

  const validateHowManyRequired = useValidationRule<number>(
    "Required",
    (field, fields) => {
      return fields.forecastType?.value === "howMany" && field.value > 0
    },
    "any",
  )

  const [users, setUsers] = useState([])
  const queryTeamMembers = useCallback(
    (evt) => {
      if (
        !isEmpty(users) ||
        form.fields.orgName.validity !== ValidityType.valid ||
        form.fields.projectName.validity !== ValidityType.valid ||
        form.fields.teamName.validity !== ValidityType.valid ||
        form.fields.adoUsername.validity !== ValidityType.valid ||
        form.fields.adoPat.validity !== ValidityType.valid
      ) {
        return
      }

      electron
        .fetchAdoUsers({
          organizationName: form.fields.orgName.value,
          projectName: form.fields.projectName.value,
          accessToken: form.fields.adoPat.value,
          teamId: form.fields.teamName.value,
          username: form.fields.adoUsername.value,
        })
        .then((results) => {
          setUsers(results)
        })
        .catch(console.error)
    },
    [form],
  )

  return (
    <Content>
      <Main>
        <MainContent>
          <Heading>Work Forecasting Tool</Heading>
          <FlexContainer direction="row">
            <Flex flex={1}>
              <Form
                id={"configuration"}
                onSubmit={handleFormSubmision}
                onReset={noop}
              >
                <FlexContainer direction="column">
                  <fieldset>
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
                            // {
                            //   label:
                            //     "How long will some number of work items take to complete?",
                            //   value: "howLong",
                            // },
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
                  </fieldset>
                  <br />

                  <fieldset>
                    <legend>Question Configuration</legend>
                    <VerticalSpacedGroup spaced={24}>
                      {form.fields.forecastType?.value === "howMany" && (
                        <Field
                          fullWidth
                          as={NumericInput}
                          defaultValue={90}
                          label="Number of Days to Forecast"
                          name="numberOfDays"
                          onBlur={noop}
                          validate={validateHowManyRequired}
                        />
                      )}
                    </VerticalSpacedGroup>
                  </fieldset>

                  <br />
                  <fieldset>
                    <legend>Data Source</legend>
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
                          <VerticalSpacedGroup spaced={24}>
                            <Field
                              fullWidth
                              as={TextField}
                              defaultValue=""
                              label="Organization Name"
                              name="orgName"
                              onBlur={noop}
                              validate={validateAdoRequired}
                            />
                            <Field
                              fullWidth
                              as={TextField}
                              defaultValue=""
                              label="Project Name"
                              name="projectName"
                              onBlur={queryTeamMembers}
                              validate={validateAdoRequired}
                            />
                            <Field
                              fullWidth
                              as={TextField}
                              defaultValue=""
                              label="Team Name"
                              name="teamName"
                              onBlur={queryTeamMembers}
                              validate={validateAdoRequired}
                            />
                            <Field
                              fullWidth
                              as={TextField}
                              defaultValue=""
                              label="Username"
                              name="adoUsername"
                              onBlur={queryTeamMembers}
                              validate={validateAdoRequired}
                            />
                            <Field
                              fullWidth
                              as={PasswordField}
                              defaultValue=""
                              label="Personal Access Token"
                              name="adoPat"
                              onBlur={queryTeamMembers}
                              validate={validateAdoRequired}
                            />
                            <Field<
                              { label: string; value: string }[],
                              {
                                isMulti: boolean
                                placeholder: string
                                options: { label: string; value: string }[]
                              }
                            >
                              fullWidth
                              isMulti
                              options={users.map((user) => ({
                                label: user.displayName,
                                value: user.id,
                              }))}
                              as={SelectField}
                              defaultValue={[]}
                              label="Team Members"
                              name="teamMemberIds"
                              placeholder="Choose users"
                              validate={validateTeamMembers}
                            />
                          </VerticalSpacedGroup>
                        </Panel>
                      </TabPanel>
                    </Tabs>
                  </fieldset>
                  <br />
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
            </Flex>
            <Flex flex={2}>
              <FlexContainer direction="column">
                {!isEmpty(dataSets.throughput) &&
                  !isEmpty(dataSets.distribution) &&
                  !isEmpty(dataSets.forecast) && (
                    <>
                      <Bordered data-test="forecastAnswer">
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
            </Flex>
          </FlexContainer>
        </MainContent>
      </Main>
    </Content>
  )
}

export default App
