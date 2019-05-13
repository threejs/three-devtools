
const SHOULD_LOG = true;

const PROCESS = typeof chrome === 'undefined' ? 'inject' :
                chrome.devtools ? 'devtools' : 'content'; // TODO

export const log = (...message) => {
  if (SHOULD_LOG) {
    
  }
}
