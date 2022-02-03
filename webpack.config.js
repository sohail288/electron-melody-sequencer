const path = require("path");
const fs = require("fs");

const srcDirectory = path.resolve(__dirname, "src");
const buildDirectory = path.resolve(__dirname, "build");

const staticFiles = {
  html: [path.resolve(srcDirectory, "index.html")],
}

class StaticFileMover {

  constructor(srcDir, destDir, staticFiles) {
    this.staticFiles = staticFiles
    this.destDir = destDir
    this.srcDir = srcDir
  }

  apply(compiler) {
    compiler.hooks.afterEnvironment.tap("StaticFileMover", (params) => {
      for (let [kind, files] of Object.entries(this.staticFiles)) {
        files.forEach(srcFile => {
          const destFile = srcFile.replace(this.srcDir, this.destDir)
          const destDir = path.dirname(destFile)
          if (!fs.existsSync(destDir)) {
            console.log(`Creating ${destDir}`);
            fs.mkdirSync(destDir, { recursive: true });
          }
          console.log(`Writing ${destFile}`);
          fs.copyFileSync(srcFile, destFile);
        })

      }

    })
  }
}

module.exports = {
  mode: "development",
  watch: !process.env.NO_WATCH,
  devtool: "inline-source-map",
  entry: {
    main: path.resolve(srcDirectory, "main.ts"),
    content: path.resolve(srcDirectory, "content.ts"),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  target: "electron-main",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "[name].js"
  },
  plugins: [
    new StaticFileMover(srcDirectory, buildDirectory, staticFiles),
  ],
};

