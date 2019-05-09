const connections = new Map();

chrome.runtime.onConnect.addListener(port => {
  let tabId;
  const onMessage = (message) => {
    tabId = message.tabId;
    console.log('background onMessage, devtools', message);
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
  console.log('background onMessage, from content', sender, request);
  if (sender.tab) {
    const tabId = sender.tab.id;
    if (connections.has(tabId)) {
      console.log('posted');
      connections.get(tabId).postMessage(request);
    }
  }
  return true;
});
