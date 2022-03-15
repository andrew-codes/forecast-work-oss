const esbuild = require("esbuild")
const { htmlPlugin } = require("@craftamap/esbuild-plugin-html")

process.env.NODE_ENV = "production"

const options = {
  entryPoints: ["src/kanban-forecasting.tsx"],
  bundle: true,
  minify: true,
  sourcemap: false,
  target: "es2015",
  metafile: true,
  outdir: "dist",
  // watch: NODE_ENV !== "production",
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
}

esbuild.build(options).catch((e) => {
  console.log(e)
  process.exit(1)
})
