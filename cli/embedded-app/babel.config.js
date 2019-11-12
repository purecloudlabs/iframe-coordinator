module.exports = {
  presets: [
    '@vue/app',
    [
      '@babel/preset-env',
      {
        useBuiltIns: 'entry',
        targets: { browsers: 'ie 11, defaults' }
      }
    ]
  ],
  exclude: ['../../dist/**/*.js']
};
