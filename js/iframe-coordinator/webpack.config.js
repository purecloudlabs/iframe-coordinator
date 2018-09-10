module.exports = {
  mode: "none",
  entry: {
    client: "./libs/client.js",
    host: "./libs/host.js"
  },
  output: {
    libraryTarget: "commonjs2",
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
      }
    ]
  }
};
