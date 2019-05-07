
// via https://github.com/jeromeetienne/threejs-inspector

if (chrome.devtools.inspectedWindow.tabId) {
  chrome.devtools.inspectedWindow.eval(`window.DevToolsAPI`, (result) => {
    console.log('result!',result);
    if (!result) {
      createPanel();
    }
  });
}


function createPanel() {
  chrome.devtools.panels.create(`three`, `assets/icon_256.png`, `src/app/index.html`, panel => {

  });
}
