'use strict';

const paths = require('../config/paths');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;

module.exports = function () {
    return {
  // Don't attempt to continue if there are any errors.
  bail: true,

    entry: {
      componentLib: paths.componentLibJs,
      coordinatorLib: paths.coordinatorLibJs
    },

  output: {
    // The build folder.
    path: paths.appBuild,

    // Append leading slash when production assets are referenced in the html.
    publicPath: publicPath,

    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,

    // Generated JS files.
    filename: '[name].js'
  },

  resolve: {
    modules: ['node_modules'],
    extensions: ['.js', '.elm']
  },

  module: {
    noParse: /\.elm$/,

    rules: [
      {
        test: /\.js$/,
        exclude: [/elm-stuff/, /node_modules/],
        loader: require.resolve('babel-loader'),
        query: {
          // Latest stable ECMAScript features
          presets: [
            [
              require.resolve('babel-preset-env'),
              {
                targets: {
                  // React parses on ie 9, so we should too
                  ie: 9,
                  // We currently minify with uglify
                  // Remove after https://github.com/mishoo/UglifyJS2/issues/448
                  uglify: true
                },
                // Disable polyfill transforms
                useBuiltIns: false,
                // Do not transform modules to CJS
                modules: false
              }
            ]
          ],
          plugins: [
            [
              require.resolve('babel-plugin-transform-runtime'),
              {
                helpers: false,
                polyfill: false,
                regenerator: true
              }
            ]
          ]
        }
      },

      {
        test: /\.elm$/,
        exclude: [/elm-stuff/, /node_modules/],
        use: [
          {
            // Use the local installation of elm-make
            loader: require.resolve('elm-webpack-loader'),
            options: {
              // If ELM_DEBUGGER was set to "true", enable it. Otherwise
              // for invalid values, "false" and as a default, disable it
              debug: process.env.ELM_DEBUGGER === 'true' ? true : false,
              pathToMake: paths.elmMake
            }
          }
        ]
      },

      {
        exclude: [/\.html$/, /\.js$/, /\.elm$/, /\.css$/, /\.json$/, /\.svg$/],
        loader: require.resolve('url-loader'),
        options: {
          limit: 10000,
          name: 'static/media/[name].[hash:8].[ext]'
        }
      }
    ]
  },

  plugins: [],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
    };
};
