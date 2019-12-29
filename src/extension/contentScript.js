// Use `text` instead of `src` to get around Chromium bug of execution order
// when using `src`, resulting in a race condition.
// https://bugs.chromium.org/p/chromium/issues/detail?id=634381#c3
const script = document.createElement('script');
script.text = `
(() => {
/**
 * This script injected by the installed three.js developer
 * tools extension.
 * https://github.com/threejs/three-devtools
 */

const $devtoolsReady = Symbol('devtoolsReady');
const $backlog = Symbol('backlog');

// The __THREE_DEVTOOLS__ target is small and light-weight, and collects
// events triggered until the devtools panel is ready, which is when
// the events are flushed.
const target = new class ThreeDevToolsTarget extends EventTarget {
  constructor() {
    super();
    this[$devtoolsReady] = false;
    this[$backlog] = [];
    this.addEventListener('devtools-ready', e => {
      this[$devtoolsReady] = true;
      for (let event of this[$backlog]) {
        this.dispatchEvent(event);
      }
    }, { once: true });
  }

  dispatchEvent(event) {
    if (this[$devtoolsReady] || event.type === 'devtools-ready') {
      super.dispatchEvent(event);
    } else {
      this[$backlog].push(event);
    }
  }
}

Object.defineProperty(window, '__THREE_DEVTOOLS__', {
  value: target,
});
})();
`;
script.onload = () => {
  script.parentNode.removeChild(script);
}
(document.head || document.documentElement).appendChild(script);

window.addEventListener('message', e => {
  if (e.source !== window ||
      typeof e.data !== 'object' ||
      e.data.id !== 'three-devtools') {
    return;
  }

  // Don't bring in the 35kb polyfill on every page
  // for a single command that doesn't matter if its callback
  // promise; handle this manually.
  const extRoot = globalThis.chrome ? globalThis.chrome : globalThis.browser;

  try {
    extRoot.runtime.sendMessage(e.data);
  } catch (error) {
    console.error(error);
    extRoot.runtime.sendMessage({
      type: 'error',
      id: 'three-devtools',
      data: error.toString(), 
    });
  }
});
