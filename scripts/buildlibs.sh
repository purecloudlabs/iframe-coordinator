#!/bin/bash

PROJ_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )/.."

printf "== Building iframe-coordinator js bindings ==\n\n"

npm ci

npm run build
