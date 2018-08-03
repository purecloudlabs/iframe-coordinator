module.exports = {
    mode: 'none',
    entry: {
        componentLib: './libs/componentLib.js',
        coordinatorLib: './libs/coordinatorLib.js'
    },
    output: {
        libraryTarget: 'commonjs2',
        filename: '[name].js',
        path: __dirname + '/dist'
    },
    module: {
        rules: [{
            test: /\.elm$/,
            exclude: [/elm-stuff/, /node_modules/],
            use: {
                loader: 'elm-webpack-loader',
                options: {}
            }
        }]
    }
};
