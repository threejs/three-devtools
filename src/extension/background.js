import browser from '../../web_modules/webextension-polyfill/dist/browser-polyfill.js';
globalThis.browser = browser;

const connections = new Map();

/**
 * When opening the three-devtools panel, store
 * a connection to communicate later.
 */
browser.runtime.onConnect.addListener(port => {
  let tabId;
  const onMessage = (message) => {
    tabId = message.tabId;
    console.log('onConnect', tabId, message.name);
    if (message.name === 'connect') {
      connections.set(tabId, port);
    }
  }

  port.onMessage.addListener(onMessage);

  port.onDisconnect.addListener(port => {
    port.onMessage.removeListener(onMessage);
    connections.delete(tabId);
  });
});

/**
 * When receiving a message from content, pass it
 * along to the devtools panel.
 */
browser.runtime.onMessage.addListener((request, sender) => {
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (connections.has(tabId)) {
      connections.get(tabId).postMessage(request);
    }
  }
  return true;
});

/**
 * When a page has reloaded; if three-devtools are open, notify
 * the devtools panel so it can inject the content-side of the tools.
 */
browser.webNavigation.onCommitted.addListener(({tabId, frameId}) => {
  // Only support top-level frame for now
  if (frameId !== 0) {
    return;
  }
  console.log('onCommitted', tabId, connections.has(tabId));
  if (connections.has(tabId)) {
    connections.get(tabId).postMessage({
      type: 'committed',
      id: 'three-devtools',
    });
  }
});
