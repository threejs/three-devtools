#!/bin/node

// Called after the version as been incremented
// via `npm version [major | minor | patch]`
// https://docs.npmjs.com/cli/version
const fs = require('fs');
const path = require('path');
const packageJSON = require('../package.json');
const version = packageJSON.version;
const manifestJSON = require('../manifest.json');

manifestJSON.version = version;

const manifestJSONPath = path.join(__dirname, '..', 'manifest.json');
const manifestString = JSON.stringify(manifestJSON, null, 2);
console.log(`Updating manifest.json with version ${version}`);
fs.writeFileSync(manifestJSONPath, manifestString);
