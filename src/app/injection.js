import browser from '../../web_modules/webextension-polyfill/dist/browser-polyfill.js';
import utils from '../content/utils.js';
import TransformControls from '../content/TransformControls.js';
import EntityCache from '../content/EntityCache.js';
import ThreeDevTools from '../content/ThreeDevTools.js';
import DevToolsScene from '../content/DevToolsScene.js';
import InstrumentedToJSON from '../content/toJSON.js';
import THREE from '../content/three.js';

const version = browser.runtime.getManifest().version;
const red = 'rgb(255, 137, 137)';
const green = 'rgb(190, 251, 125)'
const blue = 'rgb(120, 250, 228)';

export default `

console.log('%c▲%cthree-devtools%cv${version}',
  'font-size:150%; color:${green}; text-shadow: -10px 0px ${red}, 10px 0px ${blue}; padding: 0 15px 0 10px;',
  'font-size: 110%; background-color: #666; color:white; padding: 0 5px;',
  'font-size: 110%; background-color: ${blue}; color:#666; padding: 0 5px;');
(() => {

  const DEBUG = false;
  const utils = (${utils})();
  const THREE = (${THREE})();
  const InstrumentedToJSON = (${InstrumentedToJSON})();
  (${TransformControls})(THREE);
  const DevToolsScene = (${DevToolsScene})(THREE);
  const EntityCache = (${EntityCache})();
  const devtools = new (${ThreeDevTools})(window.__THREE_DEVTOOLS__);

  window.__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('devtools-ready'));
})();

`;
