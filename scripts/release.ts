import builder, { Platform } from "electron-builder"
import type { Configuration } from "electron-builder"

const run = async () => {
  try {
    let platform: Platform

    switch (process.env.PLATFORM) {
      case "Windows":
        platform = Platform.WINDOWS
        break
      case "macOS":
        platform = Platform.MAC
        break
      case "Linux":
        platform = Platform.LINUX
        break
      default:
        throw new Error(`Unsupported platform: ${process.env.PLATFORM}`)
    }

    const options: Configuration = {
      appId: "codes.andrew.forecast-work",
      productName: "Forecast Work",
      buildVersion: process.env.VERSION,
      extraMetadata: {
        name: "Forecast Work",
        main: "dist/main/main.js",
      },
      files: [
        {
          from: ".",
          filter: ["package.json", "LICENSE"],
        },
        {
          from: "dist/main",
        },
        {
          from: "dist/renderer",
        },
        "dist/",
      ],
      win: {
        target: ["portable", "nsis"],
      },
      mac: {
        target: ["dmg"],
        hardenedRuntime: true,
        gatekeeperAssess: true,
      },
      linux: {
        target: ["AppImage", "deb", "apk"],
      },
      directories: {
        buildResources: "resources",
      },
      compression: "store",
      extraFiles: ["LICENSE", "README.md"],
      deb: {
        priority: "optional",
      },
      rpm: {},
    }

    const result = await builder.build({
      targets: platform.createTarget(),
      config: options,
    })
    console.log(JSON.stringify(result))
  } catch (error) {
    console.error(error)
  }
}

run()
