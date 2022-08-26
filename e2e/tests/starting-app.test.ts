import { test, expect } from "../configuration/test"

test("App successfully launches as visible and without devtools opened.", async ({
  electronApp,
}) => {
  const windowState: {
    isVisible: boolean
    isDevToolsOpened: boolean
    isCrashed: boolean
  } = await electronApp.evaluate(async ({ BrowserWindow }) => {
    const mainWindow = BrowserWindow.getAllWindows()[0]

    const getState = () => ({
      isVisible: mainWindow.isVisible(),
      isDevToolsOpened: mainWindow.webContents.isDevToolsOpened(),
      isCrashed: mainWindow.webContents.isCrashed(),
    })

    return new Promise((resolve) => {
      if (mainWindow.isVisible()) {
        resolve(getState())
      } else {
        mainWindow.once("ready-to-show", () =>
          setTimeout(() => resolve(getState()), 0),
        )
      }
    })
  })

  expect(windowState.isVisible).toBeTruthy()
  expect(windowState.isDevToolsOpened).toBeFalsy()
  expect(windowState.isCrashed).toBeFalsy()
})

test("Shows the main heading", async ({ electronApp }) => {
  const firstWindow = await electronApp.firstWindow()

  const headingText = await firstWindow.innerText("h1")
  expect(headingText).toEqual("Work Forecasting Tool")
})
