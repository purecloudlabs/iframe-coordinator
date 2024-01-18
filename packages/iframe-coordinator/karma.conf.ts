module.exports = (config) => {
  config.set({
    basePath: "src",
    frameworks: ["jasmine", "karma-typescript"],
    plugins: ["karma-jasmine", "karma-typescript", "karma-jsdom-launcher"],
    karmaTypescriptConfig: {
      compilerOptions: {
        target: "es2015",
      },
    },
    files: ["**/*.ts"],
    exclude: ["node_modules/**/*.ts"],
    preprocessors: {
      "**/*.ts": ["karma-typescript"],
    },
    reporters: ["progress"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ["jsdom"],
    singleRun: false,
    concurrency: Infinity,
    hostname: "127.0.0.1",
  });
};
