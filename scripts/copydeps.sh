#!/bin/sh

FA=node_modules/@fortawesome/fontawesome-free

cp $FA/webfonts/* src/app/webfonts/
cp $FA/css/all.css src/app/styles/fontawesome.css
