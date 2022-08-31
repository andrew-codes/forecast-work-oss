import path from "path"
import { test, expect } from "../configuration/test"

test.skip("Given I have not set a data set, when I view the main screen, then the Configuration Pane is open.", async ({
  electronApp,
}) => {
  const firstWindow = await electronApp.firstWindow()
  expect(
    await firstWindow.locator("[data-component='NavLayout']").screenshot(),
  ).toMatchSnapshot("left sidebar starts open.png")
})
