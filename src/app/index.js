import AppElement from './elements/AppElement.js';

import SceneViewElement from './elements/SceneViewElement.js';
import ObjectViewElement from './elements/ObjectViewElement.js';
import MaterialViewElement from './elements/MaterialViewElement.js';
import TextureViewElement from './elements/TextureViewElement.js';

import TitleBarElement from './elements/TitleBarElement.js';

import ImagePreviewElement from './elements/ImagePreviewElement.js';
import KeyValueElement from './elements/values/KeyValueElement.js';
import MaterialValueElement from './elements/values/MaterialValueElement.js';
import TextureValueElement from './elements/values/TextureValueElement.js';
import EnumValueElement from './elements/values/EnumValueElement.js';

import TreeItemElement from './common-elements/TreeItemElement.js';
import AccordionViewElement from './common-elements/AccordionViewElement.js';

//////

window.customElements.define('three-devtools-app', AppElement);

window.customElements.define('scene-view', SceneViewElement);
window.customElements.define('object-view', ObjectViewElement);
window.customElements.define('material-view', MaterialViewElement);
window.customElements.define('texture-view', TextureViewElement);

window.customElements.define('title-bar', TitleBarElement);

window.customElements.define('image-preview', ImagePreviewElement);
window.customElements.define('key-value', KeyValueElement);
window.customElements.define('material-value', MaterialValueElement);
window.customElements.define('texture-value', TextureValueElement);
window.customElements.define('enum-value', EnumValueElement);

window.customElements.define('tree-item', TreeItemElement);
window.customElements.define('accordion-view', AccordionViewElement);

window.addEventListener('error', e => {
  let error = document.querySelector('#error');
  if (!error) {
    error = document.createElement('div');
    error.style = `position: absolute; width: 100%; bottom: 0; background-color: red; color: white;`
    document.body.appendChild(error);
  }
  error.innerText = e.message;
  console.log(e);
});
