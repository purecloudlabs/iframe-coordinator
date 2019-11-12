#!/bin/bash

PROJ_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )/.."
EMBEDDED_APP_DIR="${PROJ_DIR}/cli/embedded-app"
CLIENT_APP_DIR="${PROJ_DIR}/client-app-example"


if [ ! -d "${EMBEDDED_APP_DIR}/node_modules" ]; then
    echo "Installing cli-app dependencies..."
    cd "${EMBEDDED_APP_DIR}"
    npm install
fi

echo "${CLIENT_APP_DIR}/node_modules"
if [ ! -d "${CLIENT_APP_DIR}/node_modules" ]; then
    echo "Installing client-app-example dependencies..."
    cd "${CLIENT_APP_DIR}"
    npm install
fi