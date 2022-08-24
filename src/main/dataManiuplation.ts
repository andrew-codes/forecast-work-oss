import {
  cond,
  every,
  first,
  get,
  groupBy,
  identity,
  isEqual,
  map,
  pipe,
  result,
  sortBy,
  stubTrue,
  values,
} from "lodash/fp"

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

const addDays = (numberOfDays: number) => (date: Date) => {
  const newDate = new Date(date)
  return new Date(newDate.setDate(newDate.getDate() + numberOfDays))
}
const addOneWeek = addDays(7)
const reduceWithAllArgs = (iteratee, start) => (items) =>
  items.reduce(iteratee, start)
type ThroughputResult = {
  date: Date
  count: number
}
const throughput = pipe(
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
  reduceWithAllArgs(
    (acc, item: ThroughputResult, index: number, list: ThroughputResult[]) => {
      if (index === 0) {
        return acc.concat([item])
      }

      const items = acc
      let previous = addOneWeek(list[index - 1].date)
      while (previous < item.date) {
        items.push({ date: previous, count: 0 })
        previous = addOneWeek(previous)
      }
      items.push(item)

      return items
    },
    [],
  ),
)

export { getWorkItemClosedDates, throughput }
