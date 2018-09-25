'use strict';
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = [{
    entry: './src/index.js',
    mode: 'development',
    output: {
        filename: 'app.js'
    },
    plugins: [
        new CopyWebpackPlugin([{from: 'public', to: '.'}])
    ],
    devServer: {
        contentBase: './dist'
    }
},{
    entry: './src/component.js',
    mode: 'development',
    output: {
        filename: 'component-app.js'
    }
}];
