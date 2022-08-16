import { build } from "esbuild"
import { htmlPlugin } from "@craftamap/esbuild-plugin-html"

const isDev = process.env.NODE_ENV === "development"

Promise.all([
  build({
    entryPoints: ["src/main.ts", "src/preload.ts"],
    bundle: true,
    platform: "node",
    minify: !isDev,
    sourcemap: isDev,
    external: ["electron", "electron-reload"],
    watch: isDev,
    outdir: "dist",
  }),
  build({
    entryPoints: ["src/index.tsx"],
    bundle: true,
    metafile: true,
    platform: "browser",
    outdir: "dist",
    watch: isDev,
    minify: !isDev,
    sourcemap: isDev,
    plugins: [
      htmlPlugin({
        files: [
          {
            entryPoints: ["src/index.tsx"],
            filename: "index.html",
            htmlTemplate: `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta http-equiv="Content-Security-Policy" content="default-src 'self';" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Azure DevOps Forecasting App</title>
              </head>
              <body>
                <div id="root"></div>
              </body>
            </html>`,
          },
        ],
      }),
    ],
  }),
])
  .then(() => console.log("Done"))
  .catch((error) => {
    console.log(error)
    process.exit(1)
  })
