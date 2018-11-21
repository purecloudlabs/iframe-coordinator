#!/bin/bash
set -e

SCRIPTS_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"
PROJ_DIR="${SCRIPTS_DIR}/.."
NPM_UTILS="${WORKSPACE}/npm-utils"

# Check out the latest npm-utils
rm -rf ${NPM_UTILS} && git clone --depth=1 git@bitbucket.org:inindca/npm-utils.git ${NPM_UTILS}

cd ${PROJ_DIR}

# Set up node with the provided version and generate a .npmrc file for our private npm repo
source ${NPM_UTILS}/scripts/jenkins-pre-build.sh 10.13.0 -m

${SCRIPTS_DIR}/buildlibs.sh

  # Remove the pre-push hook during git tagging.
  # This may have been added during npm install and pre-push package.
  rm -f ${PROJ_DIR}.git/hooks/pre-push

${NPM_UTILS}/scripts/version-and-publish.sh -n

printf "\n== Post-build git status ==\n\n"
git status

printf "\n== Commits ==\n\n"

git log -n 3

printf "\n== Tags ==\n\n"

git tag -l
