const path = require('path');
const config = require('./webpack.config.js');

config.output.path = path.join(config.output.path, 'es5');
config.module.rules[0].options.configFile = 'tsconfig.es5.json';

module.exports = config;
