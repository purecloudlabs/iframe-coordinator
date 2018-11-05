let webpackConfig = require('./webpack.config');
if (!process.env.CHROME_BIN) {
  process.env.CHROME_BIN = require('puppeteer').executablePath();
}

module.exports = function(config) {
  config.set({
    basePath: 'src',
    frameworks: ['jasmine'],
<<<<<<< HEAD:karma.conf.js
    files: ['**/*.spec.ts'],
    exclude: ['node_modules/**/*.spec.ts'],
=======
    files: [
      '**/*.spec.ts'
    ],
    exclude: [],
>>>>>>> Moving demo-app up a level and fixing an issue with the tests:karma.conf.js
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
