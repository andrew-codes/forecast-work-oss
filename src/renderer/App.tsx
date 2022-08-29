import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  Content,
  LeftSidebar,
  Main,
  usePageLayoutResize,
} from "@atlaskit/page-layout"
import { NavigationContent, SideNavigation } from "@atlaskit/side-navigation"
import styled from "styled-components"
import UploadConfiguration from "./configuration/UploadConfiguration"
import { isEmpty, noop } from "lodash"
import { AxisOptions, Chart } from "react-charts"
import { Throughput } from "src/main/dataManiuplation"
import { filter, get, last, pipe, toString } from "lodash/fp"
import NumericInput from "./FormFields/NumericInput"

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
  > * {
    height: unset !important;
  }
  > *:last-child {
    flex: 1;
  }
  padding: 0 24px 24px;
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

const getAnswer = (confidenceLevel: number): ((dataSet: number[][]) => number) => pipe(filter(([numberOfItems, probability]) => Math.round(probability) === confidenceLevel), last, get(0))

const App = () => {
  const [dataSets, setDataSets] = useState<{ throughput: Throughput, distribution: [][], forecast: number[][] }>(
    { throughput: [], distribution: [], forecast: [] }
  )
  const [confidenceLevel, setConfidenceLevel] = useState(85)
  const handleConfidenceLevelChange = useCallback((evt, newValue: number) => {
    setConfidenceLevel(newValue)
  }, [dataSets.forecast])

  const { collapseLeftSidebar, expandLeftSidebar } = usePageLayoutResize()
  const handleSubmit = (evt, form) => {
    electron.openCsvFile(form.fields.filePath.value).then((([results, throughput, distribution, forecast]) => {
      collapseLeftSidebar()
      setDataSets({ throughput, distribution, forecast })
    }))
  }
  useEffect(() => {
    if (isEmpty(dataSets.throughput)) {
      expandLeftSidebar()
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
                <h2>Configuration</h2>
                <UploadConfiguration
                  id="uploadConfiguration"
                  onSubmit={handleSubmit}
                />
              </NavigationContent>
            </NavLayout>
          </SideNavigation>
        </LeftSidebar>
      </NavBorder>
      <Main>
        <MainContent>
          <h1>Work Forecasting Tool</h1>
          {!isEmpty(dataSets.throughput) && !isEmpty(dataSets.distribution) && !isEmpty(dataSets.forecast) && (
            <>
              <Bordered>
                <h2>90 day Forecast</h2>
                <FlexContainer>
                  <Flex flex={1}>
                    <label>Confidence Level:
                      <NumericInput
                        onBlur={noop}
                        onChange={handleConfidenceLevelChange}
                        value={confidenceLevel}
                      />
                    </label>
                  </Flex>
                  <Flex flex={3}>Answer: <strong>{answer} work items</strong></Flex>
                </FlexContainer>
              </Bordered>
              <hr />
              <h3>Throughput by Week</h3>
              <ChartContainer data-test="WeeklyThroughputChart">
                <Chart
                  options={{
                    data: [
                      { label: "Weekly Throughput", data: dataSets.throughput },
                    ],
                    dark: true,
                    primaryAxis: throughputPrimaryAxis,
                    secondaryAxes: throughputSecondaryAxes,
                  }}
                />
              </ChartContainer>
              <h3>90 day Forecast Distribution</h3>
              <ChartContainer>
                <Chart
                  options={{
                    data: [
                      { label: "90 day Forecast Distribution", data: dataSets.distribution },
                    ],

                    dark: true,
                    primaryAxis: distributionPrimaryAxis,
                    secondaryAxes: distributionSecondaryAxes,
                  }}
                />
              </ChartContainer>
              <ChartContainer>
                <h3>90 day Delivery Confidence</h3>
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
