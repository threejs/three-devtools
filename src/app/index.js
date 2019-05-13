import AppElement from './elements/AppElement.js';

import SceneViewElement from './elements/SceneViewElement.js';
import ObjectViewElement from './elements/ObjectViewElement.js';
import MaterialViewElement from './elements/MaterialViewElement.js';
import TextureViewElement from './elements/TextureViewElement.js';

import TitleBarElement from './elements/TitleBarElement.js';

import KeyValueElement from './elements/values/KeyValueElement.js';
import MaterialValueElement from './elements/values/MaterialValueElement.js';
import TreeItemElement from './common-elements/TreeItemElement.js';

//////

window.customElements.define('three-devtools-app', AppElement);

window.customElements.define('scene-view', SceneViewElement);
window.customElements.define('object-view', ObjectViewElement);
window.customElements.define('material-view', MaterialViewElement);
window.customElements.define('texture-view', TextureViewElement);

window.customElements.define('title-bar', TitleBarElement);

window.customElements.define('key-value', KeyValueElement);
window.customElements.define('material-value', MaterialValueElement);
window.customElements.define('tree-item', TreeItemElement);
