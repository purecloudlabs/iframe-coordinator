module.exports = {
  mode: "none",
  entry: {
    index: "./src/index.ts",
    client: "./src/client.ts",
    host: "./src/host.ts"
  },
  output: {
    libraryTarget: "umd",
    filename: "[name].js",
    path: __dirname + ""
  },
  module: {
    rules: [
      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: {
          loader: "elm-webpack-loader",
          options: { debug: true }
        }
      },
      {
        test: /\.ts$/,
        exclude: [/node_modules/],
        use: {
          loader: "ts-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  }
};
