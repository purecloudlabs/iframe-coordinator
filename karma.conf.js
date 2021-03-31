let webpackConfig = require('./webpack.config');
if (!process.env.CHROME_BIN) {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
}

module.exports = function(config) {
  config.set({
    basePath: 'src',
    frameworks: ['jasmine', 'webpack'],
    plugins: ['karma-jasmine', 'karma-webpack', 'karma-chrome-launcher'],
    files: ['**/*.spec.ts'],
    exclude: ['node_modules/**/*.spec.ts'],
    preprocessors: {
      '**/*.spec.ts': ['webpack']
    },
    webpack: webpackConfig,
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['ChromeHeadless'],
    singleRun: false,
    concurrency: Infinity
  });
};
