#!/bin/bash

PROJ_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )/.."

echo "** Building iframe-coordinator js bindings **"
cd ${PROJ_DIR}/js/iframe-coordinator
npm install
npm run build

echo "** Building & running demo-app **"
cd ${PROJ_DIR}/js/demo-app
npm install
npm start
