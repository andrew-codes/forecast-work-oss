import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Content,
  LeftSidebar,
  Main,
  usePageLayoutResize,
} from "@atlaskit/page-layout"
import Tabs, { Tab, TabList, TabPanel } from "@atlaskit/tabs"
import { NavigationContent, SideNavigation } from "@atlaskit/side-navigation"
import styled from "styled-components"
import { isEmpty, noop } from "lodash"
import { AxisOptions, Chart } from "react-charts"
import { Throughput } from "src/main/dataManiuplation"
import { filter, first, get, last, pipe, toString } from "lodash/fp"
import AdoConfiguration from "./configuration/AdoConfiguration"
import NumericInput from "./FormFields/NumericInput"
import UploadConfiguration from "./configuration/UploadConfiguration"

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

const FlexContainer = styled.div`
  display: flex;
  width: 100%;
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
  const handleCsvConfigurationSubmission = (evt, form) => {
    electron
      .openCsvDataSource(form.fields.filePath.value)
      .then(([results, throughput, distribution, forecast]) => {
        setDataSets({ throughput, distribution, forecast })
      })
  }

  const handleAdoConfigurationSubmission = (evt, form) => {
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

  return (
    <Content>
      <NavBorder>
        <LeftSidebar>
          <SideNavigation label="Configuration">
            <NavLayout data-component="NavLayout">
              <NavigationContent>
                <Heading as="h2">Configuration</Heading>
                <Tabs id="dataSourceTabs">
                  <TabList>
                    <Tab>ADO</Tab>
                    <Tab>CSV</Tab>
                  </TabList>
                  <TabPanel>
                    <Panel>
                      <AdoConfiguration
                        id="adoConfiguration"
                        onSubmit={handleAdoConfigurationSubmission}
                      />
                    </Panel>
                  </TabPanel>
                  <TabPanel>
                    <Panel>
                      <UploadConfiguration
                        id="uploadConfiguration"
                        onSubmit={handleCsvConfigurationSubmission}
                      />
                    </Panel>
                  </TabPanel>
                </Tabs>
              </NavigationContent>
            </NavLayout>
          </SideNavigation>
        </LeftSidebar>
      </NavBorder>
      <Main>
        <MainContent>
          <Heading>Work Forecasting Tool</Heading>
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
                        { label: "90 day Forecast", data: dataSets.forecast },
                      ],

                      dark: true,
                      primaryAxis: forecastingPrimaryAxis,
                      secondaryAxes: forecastingSecondaryAxes,
                    }}
                  />
                </ChartContainer>
              </>
            )}
        </MainContent>
      </Main>
    </Content>
  )
}

export default App
