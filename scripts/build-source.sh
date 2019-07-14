#!/bin/bash

# Zips up the necessary files and docs, sans dependencies from
# npm, to build the add-on, necessary for AMO's reviewal of code
# since @pika/web transforms the source code.

zip -r dist/three-devtools-source.zip \
  assets examples src scripts web_modules \
  manifest.json package.json package-lock.json \
  LICENSE DEVELOPMENT.md README.md
