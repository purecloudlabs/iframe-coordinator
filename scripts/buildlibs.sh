#!/bin/bash

PROJ_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )/.."

echo "** Building iframe-coordinator js bindings **"
npm ci 
npm run build