import EventDispatcher from '../content/EventDispatcher.js';
import utils from '../content/utils.js';
import ThreeDevTools from '../content/ThreeDevTools.js';

const red = 'rgb(255, 137, 137)';
const green = 'rgb(190, 251, 125)'
const blue = 'rgb(120, 250, 228)';

export default `

console.log('%c▲%cthree-devtools%cv0.1',
  'font-size:150%; color:${green}; text-shadow: -10px 0px ${red}, 10px 0px ${blue}; padding: 0 15px 0 10px;',
  'font-size: 110%; background-color: #666; color:white; padding: 0 5px;',
  'font-size: 110%; background-color: ${blue}; color:#666; padding: 0 5px;');
(() => {

  const EventDispatcher = (${EventDispatcher})();
  const utils = (${utils})();

  window.__THREE_DEVTOOLS__ = (${ThreeDevTools})();
})();

`;
