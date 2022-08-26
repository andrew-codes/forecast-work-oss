import path from "path"
import { _electron as electron, ElectronApplication, Page } from "playwright"
import { expect, test as base } from "@playwright/test"

type Fixtures = {
  electronApp: ElectronApplication
}

const test = base.extend<Fixtures>({
  electronApp: async ({ page }, use) => {
    const app = await electron.launch({
      env: {
        ELECTRON_IS_DEV: "0",
      },
      args: [path.join(__dirname, "..", "..", "dist", "main", "main.js")],
    })
    await use(app)
    await app.close()
  },
})

export { test, expect }
