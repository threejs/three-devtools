
// @TODO Check out redux-devtools here; in production,
// they inline the script tag
// https://github.com/zalmoxisus/redux-devtools-extension/blob/master/src/browser/extension/inject/pageScriptWrap.js
const script = document.createElement('script');
// Use `text` instead of `src` to get around Chromium bug of execution order
// when using `src`, resulting in a race condition. The injected script,
// rather than be externally referenced, is stringified in this scope instead.
// @TODO put this into a build script maybe, might be worth the step
// for a seldom-updated file.
// https://bugs.chromium.org/p/chromium/issues/detail?id=634381#c3
// script.src = chrome.extension.getURL('src/content/index.js');
script.text = window.SRC_CONTENT_INDEX;
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

  const { type } = e.data;

  // Don't bring in the 35kb polyfill on every page
  // for a single command that doesn't matter if its callback
  // promise; handle this manually.
  const extRoot = globalThis.chrome ? globalThis.chrome : globalThis.browser;
  extRoot.runtime.sendMessage(e.data);
});
