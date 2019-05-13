import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';


const typeToObjectType = {
  'Mesh': 'mesh',
};

export default class ObjectViewElement extends BaseElement {
  static get typeHint() { return 'object'; }

  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  render() {
    const object = this.getEntity();

    if (!object) {
      return html`<div>no object selected</div>`;
    }

    const objectType = typeToObjectType[object.type];

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .mesh { display: none; }
  [object-hint="mesh"] .mesh { display: flex; }
</style>
<title-bar title="Object View"></title-bar>
<div class="properties" object-hint="${objectType}">
  <key-value key-name="Type" value="${object.type}" type="string" property="type"></key-value>
  <key-value key-name="UUID" value="${object.uuid}" type="string" property="uuid"></key-value>
  <key-value key-name="Name" value="${object.name}" type="string" property="name"></key-value>
  <key-value key-name="Matrix Auto Update" value="${object.matrixAutoUpdate}" type="boolean" property="matrixAutoUpdate"></key-value>
  <key-value key-name="Render Order" value="${object.renderOrder || 0}" type="number" property="renderOrder"></key-value>
  <key-value key-name="Visible" value="${object.visible}" type="boolean" property="visible"></key-value>
  <key-value key-name="Receive Shadow" value="${object.receiveShadow}" property="receiveShadow" type="boolean"></key-value>
  <key-value key-name="Cast Shadow" value="${object.castShadow}" type="boolean" property="castShadow"></key-value>
  <key-value key-name="Frustum Culled" value="${object.frustumCulled}" type="boolean" property="frustumCulled"></key-value>

  <key-value class="mesh" key-name="Material" value="${object.material}" type="material" property="material"></key-value>
  <key-value class="mesh" key-name="Geometry" value="${object.geometry}" type="geometry" property="geometry"></key-value>
  <key-value class="mesh" key-name="Draw Mode" value="${object.drawMode || 0}" type="enum" property="drawMode"></key-value>
</div>
`;
  }
}
