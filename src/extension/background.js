const connections = new Map();

chrome.runtime.onConnect.addListener(port => {
  let tabId;
  const onMessage = (message) => {
    tabId = message.tabId;
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

chrome.runtime.onMessage.addListener((request, sender) => {
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (connections.has(tabId)) {
      connections.get(tabId).postMessage(request);
    }
  }
  return true;
});
