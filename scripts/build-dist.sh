#!/bin/sh

npx web-ext build \
  -i "examples" \
  -i "examples/**/*" \
  -i "scripts" \
  -i "scripts/**/*" \
  --artifacts-dir dist \
  --overwrite-dest
