import path from "path"
import { test, expect } from "../configuration/test"

test("Given I have not selected a forecasting type, when I view the UI, then the Start button is disabled", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  expect(
    await firstWindow
      .locator("button", {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(true)
})

test("Given I have not selected a forecasting type, when I change the data source to a valid value, then the Start button is disabled", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow.locator(
    '[data-component="Field"][data-test="filePath"] [data-test="FilePath"]',
  )
  expect(
    await firstWindow
      .locator("button", {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(true)
})

test("Given a how many forecasting type with a CSV data source and I have not set a CSV data source, when viewing the UI, then the Start button is disabled.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow
    .locator('[data-component="Field"][data-test="forecastType"] label input')
    .check()
  await firstWindow.locator('[role="tablist"] div', { hasText: "CSV" }).click()
  expect(
    await firstWindow
      .locator("button", {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(true)
})

test("Given a how many forecasting type with a CSV data source, when I set the number of days to a negative number, then the Start button is disabled.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow
    .locator('[data-component="Field"][data-test="forecastType"] label input')
    .check()
  await firstWindow.waitForTimeout(1500)
  await firstWindow
    .locator(
      '[data-component="Field"][data-test="filePath"] [data-test="FilePath"]',
    )
    .type(path.join(__dirname, "..", "fixtures", "valid.csv"))

  await firstWindow
    .locator('[data-component="Field"][data-test="numberOfDays"]')
    .press("Backspace")
  await firstWindow
    .locator('[data-component="Field"][data-test="numberOfDays"]')
    .press("Backspace")
  await firstWindow
    .locator('[data-component="Field"][data-test="numberOfDays"]')
    .type("0")
  await firstWindow
    .locator('[data-component="Field"][data-test="numberOfDays"]')
    .press("ArrowDown")
  expect(
    await firstWindow
      .locator("button", {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(true)
})

test.only("Given a how many forecasting type, the default of 90 days, and a valid CSV data source, when I start the forecast, then the forecast is computed and shown to the user.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow
    .locator('[data-component="Field"][data-test="forecastType"] label input')
    .check()
  await firstWindow
    .locator(
      '[data-component="Field"][data-test="filePath"] [data-test="FilePath"]',
    )
    .type(path.join(__dirname, "..", "fixtures", "valid.csv"))
  expect(
    await firstWindow
      .locator("button", {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(false)
  await firstWindow
    .locator("button", {
      hasText: "Start",
    })
    .click()
  await firstWindow.waitForTimeout(1500)
  await expect(
    firstWindow.locator('[data-test="forecastAnswer"] div > strong'),
  ).toHaveText(/^[78][0-9] work items$/)
})
