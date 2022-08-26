import { test, expect } from "../configuration/test"

test("Given I have not set a data set, when I view the main screen, then the Start button is disabled and the Configuration Pane is open.", async ({
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

  expect(
    await firstWindow.locator("[data-component='NavLayout']").screenshot(),
  ).toMatchSnapshot("left sidebar starts open.png")
})

test("", () => {})
