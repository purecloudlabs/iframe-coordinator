module.exports = [{
  mode: "none",
  entry: {
    index: "./libs/index.ts",
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
          options: { debug: true }
        }
      },
      {
        test: /\.worker\.(js|ts)$/,
        exclude: [/node_modules/],
        use: {
          loader: "worker-loader",
          options: {
            inline: true,
            fallback: false 
          }
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
}, {
  mode: "none",
  entry: {
    BackgroundClient: "./libs/BackgroundClient.ts"
  },
  target: 'webworker',
  output: {
    library: '[name]',
    libraryTarget: 'umd',
    filename: "[name].js",
    path: __dirname + ""
  },
  module: {
    rules: [
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
    extensions: [".ts", ".js"]
  }
}];
