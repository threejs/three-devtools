import AppElement from './elements/AppElement.js';

import SceneViewElement from './elements/SceneViewElement.js';
import ObjectViewElement from './elements/ObjectViewElement.js';
import MaterialViewElement from './elements/MaterialViewElement.js';

import KeyValueElement from './elements/KeyValueElement.js';
import MaterialValueElement from './elements/MaterialValueElement.js';
import TitleBarElement from './elements/TitleBarElement.js';
import TreeItemElement from './common-elements/TreeItemElement.js';

//////

window.customElements.define('three-devtools-app', AppElement);

window.customElements.define('scene-view', SceneViewElement);
window.customElements.define('object-view', ObjectViewElement);
window.customElements.define('material-view', MaterialViewElement);

window.customElements.define('key-value', KeyValueElement);
window.customElements.define('material-value', MaterialValueElement);
window.customElements.define('title-bar', TitleBarElement);
window.customElements.define('tree-item', TreeItemElement);
