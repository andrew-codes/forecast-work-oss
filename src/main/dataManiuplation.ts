import { sample } from "lodash"
import {
  chunk,
  cond,
  entries,
  every,
  first,
  flatten,
  get,
  groupBy,
  identity,
  isEqual,
  map,
  pipe,
  reduce,
  result,
  sortBy,
  stubTrue,
  sum,
  values,
} from "lodash/fp"
import fetch from "node-fetch"

type Throughput = { date: Date; count: number }[]

const useFirstColumn = pipe(map(values), map(get(0)))
const useColumnByName = (name: string) => map(get(name))
const hasOnlyOneColumn = pipe(values, result("length"), isEqual(1))
const allHaveOnlyOneColumn = pipe(values, every(hasOnlyOneColumn))

const convertToDate = map((value: string) => new Date(value))

const getWorkItemClosedDates = pipe(
  cond([
    [allHaveOnlyOneColumn, useFirstColumn],
    [stubTrue, useColumnByName("Closed Date")],
  ]),
  convertToDate,
)

const reduceWithAllArgs = (iteratee, start) => (items) =>
  items.reduce(iteratee, start)
type ThroughputResult = {
  date: Date
  count: number
}
const mapWithAllArgs = (iteratee) => (items) => items.map(iteratee)

const getThroughput: (dates: Date[]) => Throughput = pipe(
  sortBy(identity),
  map((date: Date) => {
    const weekDayNumber = date.getDay()
    let daysToSubtract = weekDayNumber - 1
    if (daysToSubtract < 0) {
      daysToSubtract = 6
    }

    return new Date(new Date(date.setDate(date.getDate() - daysToSubtract)))
  }),
  map(
    (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0),
  ),
  groupBy(identity),
  values,
  map((dates: Date[]) => ({ date: first(dates), count: dates.length })),
)
const aggregateFillBy = (aggregateFillFn: (item: Date) => Date) =>
  reduceWithAllArgs(
    (acc, item: ThroughputResult, index: number, list: ThroughputResult[]) => {
      if (index === 0) {
        return acc.concat([item])
      }

      const items = acc
      let previous = aggregateFillFn(list[index - 1].date)
      while (previous < item.date) {
        items.push({ date: previous, count: 0 })
        previous = aggregateFillFn(previous)
      }
      items.push(item)

      return items
    },
    [],
  )
const addDays = (numberOfDays: number) => (date: Date) => {
  const newDate = new Date(date)
  return new Date(newDate.setDate(newDate.getDate() + numberOfDays))
}
const addOneWeek = addDays(7)
const addOneDay = addDays(1)
const getThroughputByDay: (dates: Date[]) => Throughput = pipe(
  getThroughput,
  aggregateFillBy(addOneDay),
)
const getThroughputByWeek = pipe(getThroughput, aggregateFillBy(addOneWeek))

const createSampleDataSet =
  (n: number) =>
  (data: any[]): any[] => {
    return new Array(n).fill(null).map(() => sample(data))
  }
const totalCount = pipe(map(get("count")), sum)
const createSimulationIterations = (n: number) => (dataSet: any[]) =>
  new Array(n).fill(dataSet)
const createSimulationDistribution =
  (n: number, numberOfDays: number) => (data) => {
    const dataSet = pipe(
      createSimulationIterations(n),
      map(createSampleDataSet(numberOfDays)),
      map(totalCount),
      groupBy(identity),
      entries,
    )(data)

    return pipe(map(([key, value]) => [parseInt(key, 10), value.length / n]))(
      dataSet,
    )
  }

const computeTotalProbability = pipe(map(get(1)), sum)
const createForecastFromDistribution = pipe(
  mapWithAllArgs(([numberOfItems], index, list) => [
    numberOfItems,
    (1 - computeTotalProbability(list.slice(0, index - 1))) * 100,
  ]),
  sortBy(get(0)),
)

const fetchWorkItemDetails = (adoUrl: URL, headers: {}) =>
  pipe(
    map(get("id")),
    chunk(200),
    reduce(
      (acc, ids) =>
        acc.concat([
          fetch(adoUrl.toString(), {
            headers,
            method: "POST",
            body: JSON.stringify({
              ids,
              errorPolicy: "Omit",
              fields: ["Microsoft.VSTS.Common.ClosedDate"],
            }),
          }),
        ]),
      [],
    ),
  )

export {
  getWorkItemClosedDates,
  getThroughputByDay,
  getThroughputByWeek,
  createSampleDataSet,
  createSimulationDistribution,
  createForecastFromDistribution,
  fetchWorkItemDetails,
}
export type { Throughput }
