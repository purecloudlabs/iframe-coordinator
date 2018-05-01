'use strict';

const paths = require('../config/paths');
const prodConfig = require('./webpack.config.prod.js');

module.exports = function () {
    let config = prodConfig();

    config.entry = {
        "componentLib.debug": paths.componentLibJs,
        "coordinatorLib.debug": paths.coordinatorLibJs
    };

    config.module.rules = config.module.rules.map((rule) => {
        if (rule.use && rule.use[0] && rule.use[0].pathToMake == paths.elmMake) {
            rule.use[0].debug = true;
        }
        return rule;
    });

    return config;

};
