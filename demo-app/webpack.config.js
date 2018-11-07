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
                        'modules': false,
                        'useBuiltIns': 'entry'
                    }
                ]
            ]
        }
    }
};

module.exports = [{
    entry: './src/index.js',
    mode: 'development',
    output: {
        libraryTarget: "umd",
        filename: 'app.js'
    },
    plugins: [
        new CopyWebpackPlugin([{from: 'public', to: '.'}])
    ],
    devServer: {
        contentBase: './dist'
    },
    module: {
        rules: [
            babelRule
        ]
    }
},{
    entry: './src/component.js',
    mode: 'development',
    output: {
        libraryTarget: "umd",
        filename: 'component-app.js'
    },
    module: {
        rules: [
            babelRule
        ]
    }
}];