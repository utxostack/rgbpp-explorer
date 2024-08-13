#!/bin/bash

export GIT_COMMIT_HASH=$(git rev-parse --short HEAD)
export GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
export APP_VERSION=$(node -p "require('./package.json').version")
