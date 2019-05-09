
const inject = () => {
  // @TODO Check out redux-devtools here; in production,
  // they inline the script tag
  // https://github.com/zalmoxisus/redux-devtools-extension/blob/master/src/browser/extension/inject/pageScriptWrap.js
  const script = document.createElement('script');
  script.src = chrome.extension.getURL('src/content/index.js');
  script.type = 'module';
  return new Promise(resolve => {
    script.onload = () => {
      script.parentNode.removeChild(script);'
      resolve();
    }
    (document.head || document.documentElement).appendChild(script);
  });
}

inject();

window.addEventListener('message', e => {
  console.log('contentscript', e);
  if (e.source !== window ||
      typeof e.data !== 'object' ||
      e.data.id !== 'three-devtools') {
    return;
  }

  const { type } = e.data;

  chrome.runtime.sendMessage(e.data);
});
