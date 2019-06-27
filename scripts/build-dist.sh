#!/bin/bash

rm -rf three-devtools
mkdir three-devtools

cp -r src three-devtools
cp -r web_modules three-devtools
cp -r assets three-devtools
cp package.json three-devtools
cp manifest.json three-devtools
cp README.md three-devtools
cp LICENSE three-devtools

if [ ! -z "$1" ] && [ $1 == 'chrome' ] ;
then
  echo "Building Chrome variation."
  cat manifest.json | \
    json -e 'delete this.browser_specific_settings' > \
    three-devtools/manifest.json
fi

npx web-ext build \
  --source-dir three-devtools \
  --artifacts-dir dist \
  --overwrite-dest

rm -r three-devtools
