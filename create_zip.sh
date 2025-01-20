#!/usr/bin/env bash

set -euxo pipefail
cd "$(dirname "$0")" # root folder

zip -r show-image-sizes.zip \
  readme_pictures \
  background.js \
  LICENSE \
  manifest.json \
  README.md \
  showImageSize.js