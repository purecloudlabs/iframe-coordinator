const path = require('path');

module.exports = {
  mode: "none",
  entry: {
    index: "./libs/index.ts",
    client: "./libs/client.ts",
    host: "./libs/host.ts"
  },
  output: {
    libraryTarget: "umd",
    filename: "[name].js",
    path: path.resolve(__dirname, "")
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
