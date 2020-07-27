## 0.4.0 (2020/7/27)

### New

* Added inspector view in the rendering panel to debug WebGLRenderers.

### Changes

* Improve styling for the rendering panel.
* Add parameters for lights.
* Fixed int and radian parameters in the parameters view.
* Parameters view will now display readonly parameters.
* Added and updated parameters for many material types.
* Added tooltips to properties in parameters view.
* InstancedBufferGeometry now correctly identified as Geometry. 
* SkinnedMesh and InstancedMesh now correctly identified as Mesh.
* Inspecting a CompressedTexture should no longer throw an error.

## 0.3.1

* Fix the setting of boolean properties from an entity's parameter view.

## 0.3.0

* Add several views to filter entities: Scene graph, geometry, materials, textures, and renderer.
* Improved heuristics on displaying all available entities in overviews, rather than needing to refresh often.
* Significant improvement to scenes with large assets/data (textures, geometry).
* Entity dependencies are now shown as links in the parameter view -- select a Mesh's material, or geometry, for example.
* Add ability to modify vectors in the parameters view, like position and scale.

## 0.2.1

* Rejoice! Extensions now support [major.minor.patch] format in versions.
* Display three.js revision found in content to console
* Display correct extension version in console

## 0.2

* Refresh button to get latest changes of a scene
* Fixed issues in debugging scenes with unserializable objects (InterleavedBufferAttribute, WebGLRenderTarget, DataTexture, ParametricGeometry)
* Style improvements (@jacobcoughenour)
* Dark theme support (@jacobcoughenour)

## 0.1

Initial Release
