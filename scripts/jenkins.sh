#!/bin/bash
set +x

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
PROJ_DIR="${SCRIPTS_DIR}/.."
NPM_UTILS="${PROJ_DIR}/npm-utils"

cd ${PROJ_DIR}

# Check out the latest npm-utils
git clone --depth=1 git@bitbucket.org:inindca/npm-utils.git ${NPM_UTILS}

cd ${PROJ_DIR}/js/iframe-coordinator

# Set up node with the provided version and generate a .npmrc file for our private npm repo
source ${NPM_UTILS}/scripts/jenkins-pre-build.sh 8.11.4 -m

${SCRIPTS_DIR}/buildlibs.sh

${NPM_UTILS}/scripts/version-and-publish.sh