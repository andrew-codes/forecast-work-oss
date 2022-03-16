import esbuild from "esbuild"
import { createServer, request } from "http"
import { htmlPlugin } from "@craftamap/esbuild-plugin-html"

const { PORT } = process.env
process.env.NODE_ENV = "development"
const port = parseInt(!!PORT ? PORT : "8080", 10)
const esbuildPort = port + 1
const clients = []
const outDir = "dist"

const options = {
  assetNames: "[name]",
  entryPoints: ["src/kanban-forecasting.tsx"],
  bundle: true,
  sourcemap: true,
  target: "es2015",
  metafile: true,
  outdir: outDir,
  banner: {
    js: ` (() => new EventSource("http://localhost:${port}/esbuild").onmessage = () => {
      document.querySelector('#root').innerText = "Reload page to see latest changes."
    })();`,
  },
  plugins: [
    htmlPlugin({
      files: [
        {
          entryPoints: ["src/kanban-forecasting.tsx"],
          filename: "kanban-forecasting.html",
          htmlTemplate: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script defer src="lib/VSS.SDK.min.js"></script>
</head>
<body>
  <div id="root">
  </div>
</body>
</html>`,
        },
      ],
    }),
  ],
  watch: {
    onRebuild(error) {
      clients.forEach((res) => res.write("data: update\n\n"))
      clients.length = 0
      console.log(error ? error : "...")
    },
  },
}

esbuild.build(options).catch((e) => {
  console.log(e)
  process.exit(1)
})

esbuild.serve({ port: esbuildPort, servedir: "dist" }, {}).then(() => {
  createServer((req, res) => {
    const { url, method, headers } = req
    if (req.url === "/esbuild")
      return clients.push(
        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        }),
      )
    const path = ~url.split("/").pop().indexOf(".") ? url : `/index.html` //for PWA with router
    req.pipe(
      request(
        { hostname: "0.0.0.0", port: esbuildPort, path, method, headers },
        (prxRes) => {
          res.writeHead(prxRes.statusCode, prxRes.headers)
          prxRes.pipe(res, { end: true })
        },
      ),
      { end: true },
    )
  }).listen(port)
})
