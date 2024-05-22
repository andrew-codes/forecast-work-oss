import { BuildOptions } from "esbuild"
import path from "path"

const config: BuildOptions = {
  platform: "browser",
  entryPoints: [path.resolve("src/renderer/index.tsx")],
  bundle: true,
  target: "chrome100", // electron version target
  minify: process.env.NODE_ENV === "production",
}

export default config
