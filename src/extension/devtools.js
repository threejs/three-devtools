import browser from '../../web_modules/webextension-polyfill/dist/browser-polyfill.js';
globalThis.browser = browser;

if (browser.devtools.inspectedWindow.tabId) {
  // As of now, only inspect content windows, not when
  // debugging a devtools panel for example.
  browser.devtools.inspectedWindow.eval(`window.DevToolsAPI`).then(([result,error]) => {
    if (!result) {
      createPanel();
    }
  });
}


async function createPanel() {
  // It appears that Chrome treats URLs relative to extension root,
  // and Firefox treats it relative to the devtools page.
  // Use `/` to circumvent.
  const icon = '/assets/icon_128.png';
  const url = '/src/app/index.html';
  const panel = await browser.devtools.panels.create(`three`, icon, url);
}
