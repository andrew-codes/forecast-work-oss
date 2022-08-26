import path from "path"
import { PlaywrightTestConfig } from "@playwright/test"

const config: PlaywrightTestConfig = {
  use: {
    headless: true,
  },
  testDir: path.join(__dirname, "e2e"),
  globalSetup: path.join(__dirname, "e2e", "configuration", "setup.ts"),
}
export default config
