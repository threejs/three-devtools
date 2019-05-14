#!/bin/sh

FA=node_modules/@fortawesome/fontawesome-free

cp $FA/webfonts/fa-regular-400.* src/app/webfonts/
cp $FA/css/fontawesome.css src/app/styles/fontawesome.css
cat $FA/css/regular.css >> src/app/styles/fontawesome.css
