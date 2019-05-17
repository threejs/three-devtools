
if (chrome.devtools.inspectedWindow.tabId) {
  // As of now, only inspect content windows, not when
  // debugging a devtools panel for example.
  chrome.devtools.inspectedWindow.eval(`window.DevToolsAPI`, (result) => {
    if (!result) {
      createPanel();
    }
  });
}


function createPanel() {
  chrome.devtools.panels.create(`three`, `assets/icon_256.png`, `src/app/index.html`, panel => {

  });
}
