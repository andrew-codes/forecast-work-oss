import path from "path"
import { test, expect } from "../configuration/test"

test("Given I have not set a CSV file in the Configuration Pane, when I view the Configuration Pane, then the Start button is disabled.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow.locator('[role="tablist"] div', { hasText: "CSV" }).click()
  expect(
    await firstWindow
      .locator('[data-test="uploadConfiguration"] button', {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(true)
})

test("Given I am have set a valid configuration in the Configuration Pane, when I view the Configuration Pane, then the Start button is enabled.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow.locator('[role="tablist"] div', { hasText: "CSV" }).click()
  await firstWindow
    .locator(
      '[data-component="Field"][data-test="filePath"] [data-test="FilePath"]',
    )
    .type(path.join(__dirname, "..", "fixtures", "valid.csv"))
  expect(
    await firstWindow
      .locator('[data-test="uploadConfiguration"] button', {
        hasText: "Start",
      })
      .isDisabled(),
  ).toEqual(false)
})
