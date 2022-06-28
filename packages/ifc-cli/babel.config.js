module.exports = {
  presets: [
    '@vue/app',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        corejs: "core-js@2",
        targets: { browsers: 'ie 11, defaults' }
      }
    ]
  ],
  exclude: ['../../dist/**/*.js']
};
