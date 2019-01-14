#!/usr/bin/env bash

./node_modules/.bin/typedoc --excludePrivate --ignoreCompilerErrors \
--exclude **/Lifecyle.ts \
--mode file \
--readme README.md \
--module umd \
--target ES6 \
--out doc/ \
src/client.ts
