jest.mock('lodash', () => ({
  ...jest.requireActual('lodash'),
  sample: jest.fn(),
}))
import { sample } from 'lodash'
import { getWorkItemClosedDates, getThroughputByWeek, getThroughputByDay, createSampleDataSet } from "../dataManiuplation"

test("Given a collection of work items, when getting these as closed dates, then it returns the 'Closed Date' property as a Date.", () => {
  const rows = [
    { someOtherProperty: "1", "Closed Date": "7/20/2022 10:55:23 AM" },
    { someOtherProperty: "1", "Closed Date": "7/18/2022 5:28:13 PM" },
    { someOtherProperty: "1", "Closed Date": "7/19/2022 5:46:30 PM" },
    { someOtherProperty: "1", "Closed Date": "7/19/2022 5:54:15 PM" },
    { someOtherProperty: "1", "Closed Date": "7/19/2022 5:54:15 PM" },
    { someOtherProperty: "1", "Closed Date": "7/19/2022 5:46:30 PM" },
  ]
  const expected = [
    new Date("7/20/2022 10:55:23 AM"),
    new Date("7/18/2022 5:28:13 PM"),
    new Date("7/19/2022 5:46:30 PM"),
    new Date("7/19/2022 5:54:15 PM"),
    new Date("7/19/2022 5:54:15 PM"),
    new Date("7/19/2022 5:46:30 PM"),
  ]
  const actual = getWorkItemClosedDates(rows)
  expect(actual).toEqual(expected)
})

test("Given a collection of objects with only one property, when getting these as closed dates, then it returns single property as a Date.", () => {
  const rows = [
    { singleProperty: "7/20/2022 10:55:23 AM" },
    { singleProperty: "7/18/2022 5:28:13 PM" },
    { singleProperty: "7/19/2022 5:46:30 PM" },
    { singleProperty: "7/19/2022 5:54:15 PM" },
    { singleProperty: "7/19/2022 5:54:15 PM" },
    { singleProperty: "7/19/2022 5:46:30 PM" },
  ]
  const expected = [
    new Date("7/20/2022 10:55:23 AM"),
    new Date("7/18/2022 5:28:13 PM"),
    new Date("7/19/2022 5:46:30 PM"),
    new Date("7/19/2022 5:54:15 PM"),
    new Date("7/19/2022 5:54:15 PM"),
    new Date("7/19/2022 5:46:30 PM"),
  ]
  const actual = getWorkItemClosedDates(rows)
  expect(actual).toEqual(expected)
})

test("Given a collection of dates, when getting the throughput by week, then it returns the the the start date of each week that is inbetween the earliest and latest dates along with the number of dates that were within each week.", () => {
  const input = [
    new Date("8/23/2022 5:28:13 PM"),
    new Date("9/7/2022 5:46:30 PM"),
    new Date("8/27/2022 5:46:30 PM"),
    new Date("8/31/2022 5:54:15 PM"),
    new Date("8/22/2022 10:55:23 AM"),
    new Date("8/3/2022 5:54:15 PM"),
  ]
  const actual = getThroughputByWeek(input)
  expect(actual).toEqual([
    { date: new Date("8/1/2022 12:00:00 AM"), count: 1 },
    { date: new Date("8/8/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/15/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/22/2022 12:00:00 AM"), count: 3 },
    { date: new Date("8/29/2022 12:00:00 AM"), count: 1 },
    { date: new Date("9/5/2022 12:00:00 AM"), count: 1 },
  ])
})

test("Given a collection of dates, when getting the throughput by day, then it returns the the the start date of each week that is inbetween the earliest and latest dates along with the number of dates that were within each day.", () => {
  const input = [
    new Date("8/23/2022 5:28:13 PM"),
    new Date("9/7/2022 5:46:30 PM"),
    new Date("8/27/2022 5:46:30 PM"),
    new Date("8/31/2022 5:54:15 PM"),
    new Date("8/22/2022 10:55:23 AM"),
    new Date("8/3/2022 5:54:15 PM"),
  ]
  const actual = getThroughputByDay(input)
  expect(actual).toEqual([
    { date: new Date("8/1/2022 12:00:00 AM"), count: 1 },
    { date: new Date("8/2/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/3/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/4/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/5/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/6/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/7/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/8/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/9/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/10/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/11/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/12/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/13/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/14/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/15/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/16/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/17/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/18/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/19/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/20/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/21/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/22/2022 12:00:00 AM"), count: 3 },
    { date: new Date("8/23/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/24/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/25/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/26/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/27/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/28/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/29/2022 12:00:00 AM"), count: 1 },
    { date: new Date("8/30/2022 12:00:00 AM"), count: 0 },
    { date: new Date("8/31/2022 12:00:00 AM"), count: 0 },
    { date: new Date("9/1/2022 12:00:00 AM"), count: 0 },
    { date: new Date("9/2/2022 12:00:00 AM"), count: 0 },
    { date: new Date("9/3/2022 12:00:00 AM"), count: 0 },
    { date: new Date("9/4/2022 12:00:00 AM"), count: 0 },
    { date: new Date("9/5/2022 12:00:00 AM"), count: 1 },
  ])
})

test('Given a sampling of N items, when sampling a dataset, then it returns an array of N random items from the dataset.', () => {
  jest.mocked(sample).mockReturnValue('randomItem')
  const actual = createSampleDataSet(100)([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  expect(actual).toHaveLength(100)
  actual.forEach(item => expect(item).toEqual('randomItem'))
});


