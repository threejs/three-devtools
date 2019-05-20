# three-devtools

**three-devtools** is a web extension that allows inspection of three.js content.

## Current API

This API has not been thought out at all, but this will register your
THREE.Scene and THREE.Renderer to be observed by the tools.

```js
if (window.ThreeDevTools) {
  window.ThreeDevTools.connect({ scene, renderer });
}
```

## Development

Architecture & development notes can be found in [DEVELOPMENT.md](DEVELOPMENT.md).
