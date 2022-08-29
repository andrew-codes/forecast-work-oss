import path from "path"
import { test, expect } from "../configuration/test"

test.skip("Given I am have set a valid configuration in the Configuration Pane, when I view click the start button, then the Configuration Pane is collapsed and the throughput is visible.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  await firstWindow
    .locator(
      '[data-component="Field"][data-test="filePath"] [data-test="FilePath"]',
    )
    .type(path.join(__dirname, "..", "fixtures", "valid.csv"))
  await firstWindow
    .locator("button", {
      hasText: "Start",
    })
    .click()
  await firstWindow.waitForTimeout(1500)
  expect(
    await firstWindow
      .locator('[data-test="WeeklyThroughputChart"]')
      .screenshot(),
  ).toMatchSnapshot("weekly-throughput-chart.png")
})
