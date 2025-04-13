#!/usr/bin/env sh

git submodule foreach "git checkout -b \"${1}\""
git checkout -b "${1}"
