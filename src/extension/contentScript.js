window.addEventListener('message', e => {
  if (e.source !== window ||
      typeof e.data !== 'object' ||
      e.data.id !== 'three-devtools') {
    return;
  }

  const { type } = e.data;

  // Don't bring in the 35kb polyfill on every page
  // for a single command that doesn't matter if its callback
  // promise; handle this manually.
  const extRoot = globalThis.chrome ? globalThis.chrome : globalThis.browser;
  extRoot.runtime.sendMessage(e.data);
});
