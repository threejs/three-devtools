console.log('in a panel', chrome.devtools);

const port = chrome.runtime.connect({
  name: 'three-devtools',
});

port.postMessage({
  name: 'connect',
  tabId: chrome.devtools.inspectedWindow.tabId,
});

port.onDisconnect.addListener(request => {
  console.log('disconnected from background');
});

port.onMessage.addListener(request => {
  console.log('panel request receive', request);
});

chrome.devtools.inspectedWindow.eval('__THREE_DEVTOOLS__.updateScenes()');
