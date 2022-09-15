if (!process.env.CHROME_BIN) {
  /* tslint:disable-next-line */
  process.env.CHROME_BIN = require('puppeteer').executablePath();
}

module.exports = config => {
  config.set({
    basePath: 'src',
    frameworks: ['jasmine', 'karma-typescript'],
    plugins: ['karma-jasmine', 'karma-typescript', 'karma-chrome-launcher'],
    karmaTypescriptConfig: {
      compilerOptions: {
        target: 'es2015'
      }
    },
    files: ['**/*.ts'],
    exclude: ['node_modules/**/*.ts'],
    preprocessors: {
      '**/*.ts': ['karma-typescript']
    },
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
