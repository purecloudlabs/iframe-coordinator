#!/bin/bash -e

PROJ_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )/.."

${PROJ_DIR}/scripts/buildlibs.sh

echo "** Building & running demo-app **"
cd ${PROJ_DIR}/js/demo-app
npm install
npm start
