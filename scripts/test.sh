#!/bin/bash

PROJ_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )/.."

${PROJ_DIR}/js/iframe-coordinator/node_modules/.bin/elm-test
