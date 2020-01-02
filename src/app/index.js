import browser from '../../web_modules/webextension-polyfill/dist/browser-polyfill.js';
import getAgent from '../../web_modules/@egjs/agent.js';
import AppElement from './elements/AppElement.js';

import RendererViewElement from './elements/RendererViewElement.js';
import SceneViewElement from './elements/SceneViewElement.js';
import ResourcesViewElement from './elements/ResourcesViewElement.js';
import ParametersViewElement from './elements/ParametersViewElement.js';

import TitleBarElement from './elements/TitleBarElement.js';

import ImagePreviewElement from './elements/ImagePreviewElement.js';
import KeyValueElement from './elements/values/KeyValueElement.js';
import MaterialValueElement from './elements/values/MaterialValueElement.js';
import TextureValueElement from './elements/values/TextureValueElement.js';
import EnumValueElement from './elements/values/EnumValueElement.js';
import TabBarElement from './elements/TabBarElement.js';

import NumberInputElement from './common-elements/NumberInputElement.js';
import TreeItemElement from './common-elements/TreeItemElement.js';
import AccordionViewElement from './common-elements/AccordionViewElement.js';
import DevtoolsMessageElement from './common-elements/DevtoolsMessageElement.js';
import DevtoolsIconElement from './common-elements/DevtoolsIconElement.js';
import DevtoolsButtonElement from './common-elements/DevtoolsButtonElement.js';
import DevtoolsIconButtonElement from './common-elements/DevtoolsIconButtonElement.js';
import IconElement from './common-elements/IconElement.js';

//////
globalThis.browser = browser;

window.customElements.define('three-devtools-app', AppElement);

window.customElements.define('renderer-view', RendererViewElement);
window.customElements.define('scene-view', SceneViewElement);
window.customElements.define('resources-view', ResourcesViewElement);
window.customElements.define('parameters-view', ParametersViewElement);

window.customElements.define('title-bar', TitleBarElement);

window.customElements.define('image-preview', ImagePreviewElement);
window.customElements.define('key-value', KeyValueElement);
window.customElements.define('material-value', MaterialValueElement);
window.customElements.define('texture-value', TextureValueElement);
window.customElements.define('enum-value', EnumValueElement);
window.customElements.define('tab-bar', TabBarElement);

window.customElements.define('number-input', NumberInputElement);
window.customElements.define('tree-item', TreeItemElement);
window.customElements.define('accordion-view', AccordionViewElement);
window.customElements.define('devtools-message', DevtoolsMessageElement);
window.customElements.define('devtools-icon', DevtoolsIconElement);
window.customElements.define('devtools-button', DevtoolsButtonElement);
window.customElements.define('devtools-icon-button', DevtoolsIconButtonElement);
window.customElements.define('x-icon', IconElement);

function changeTheme(themeName) {
  // chrome "default" = firefox "light"
  if (themeName === 'default' || themeName === 'light') {
    document.documentElement.classList.remove('-theme-with-dark-background');
    // assume dark theme for anything else (including third-party themes)
  } else {
    document.documentElement.classList.add('-theme-with-dark-background');
  }
}

// firefox devtools are not reloaded when the theme is changed
// so we have to add a listener for it
if (browser.devtools.panels.onThemeChanged) {
  browser.devtools.panels.onThemeChanged.addListener(changeTheme);
}

// match browser devtools theme setting
changeTheme(browser.devtools.panels.themeName);

const agent = getAgent(window.navigator.userAgent);
console.log('Parsed agent:', agent);
if (agent.os.name === 'window') {
  document.body.classList.add('platform-windows');
} else if (agent.os.name === 'mac') {
  document.body.classList.add('platform-mac');
} else if (agent.os.name === 'unknown') {
  document.body.classList.add('platform-linux');
}

window.addEventListener('error', e => {
  document.querySelector('three-devtools-app').setError(e.message);
});
