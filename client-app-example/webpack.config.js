'use strict';
const CopyWebpackPlugin = require('copy-webpack-plugin');

let babelRule = {
  test: /\.js$/,
  // Note: node_modules should not be excluded here to transpile dependencies
  use: {
    loader: 'babel-loader',
    options: {
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: [
              'last 2 chrome version',
              'last 2 firefox version',
              'last 2 safari version',
              'ie 11'
            ]
          }
        ]
      ]
    }
  }
};

module.exports = [
  {
    entry: './src/client.js',
    mode: 'development',
    output: {
      libraryTarget: 'umd',
      filename: 'client-app.js'
    },
    plugins: [new CopyWebpackPlugin([{ from: 'public', to: '.' }])],
    devServer: {
      contentBase: './dist'
    },
    module: {
      rules: [babelRule]
    }
  }
];
