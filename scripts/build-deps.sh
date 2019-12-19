#!/bin/bash

npm install
npx @pika/web --dest web_modules/
./scripts/genlicenses.sh

# Copy over the non-module form of three.js for injection
# in the content. This beautiful hack fakes a CommonJS
# environment so that:
# 1) No global scope pollution or clobbering content's version of three.js
# 2) Can be stringified and lazily injected along with the other content
#    side objects (src/content/). Need access to the full context in order
#    for Function.prototype.toString to work.
# 3) Content-side devtools code can use its own private instance of three.js
#    to do things like injecting a bounding box visual.
echo 'export default () => {'             > src/content/three.js
echo '  var exports = {};'                >> src/content/three.js
echo '  var module = { exports };'        >> src/content/three.js
cat node_modules/three/build/three.min.js >> src/content/three.js
echo '  return exports;'                  >> src/content/three.js
echo '};'                              >> src/content/three.js

# Replace all instances of __THREE_DEVTOOLS__ in
# the internal three.js so we're not recursively
# complicating things, for example, we get a 'registration'
# event from the internal version and can't determine
# whether its the internal version, or a content version
# that should be debugged.
sed -i -e 's/__THREE_DEVTOOLS__/__INTERNAL_THREE_DEVTOOLS__/g' src/content/three.js

# Copy over the non-modified version of TransformControls
echo 'export default (THREE) => {'        > src/content/TransformControls.js
cat node_modules/three/examples/js/controls/TransformControls.js >> src/content/TransformControls.js
echo '};'                                 >> src/content/TransformControls.js
