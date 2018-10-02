module.exports = {
  mode: "none",
  entry: {
    client: "./libs/client.ts",
    host: "./libs/host.ts"
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
          options: {}
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
