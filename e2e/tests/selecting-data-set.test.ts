import { first } from 'lodash'
import path from 'path'
import { test, expect } from "../configuration/test"

test("Given I have not set a data set, when I view the main screen, then the Configuration Pane is open.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  expect(
    await firstWindow.locator("[data-component='NavLayout']").screenshot(),
  ).toMatchSnapshot("left sidebar starts open.png")
})

test("Given I have not set a CSV file in the Configuration Pane, when I view the Configuration Pane, then the Start button is disabled.", async ({ electronApp }) => {
  const firstWindow = await electronApp.firstWindow()
  expect(
    await firstWindow
      .locator("button", {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(true)
})

test("Given I am have set a valid configuration in the Configuration Pane, when I view the Configuration Pane, then the Start button is enabled.", async ({ electronApp }) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow.locator('[data-component="Field"][data-test="filePath"] [data-test="FilePath"]').type(path.join(__dirname, '..', 'fixtures', 'valid.csv'))
  expect(
    await firstWindow
      .locator("button", {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(false)
})
