import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';
import { objectTypeToCategory } from '../utils.js';

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

    const objectType = objectTypeToCategory(object.type);

    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .properties {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .mesh { display: none; }
  [object-hint="mesh"] .mesh { display: flex; }
</style>
<title-bar title="Object View">
  <devtools-icon-button icon="refresh">
</title-bar>
<div class="properties" object-hint="${objectType}">
  <key-value uuid=${this.uuid} key-name="Type" .value="${object.type}" type="string" property="type"></key-value>
  <key-value uuid=${this.uuid} key-name="UUID" .value="${object.uuid}" type="string" property="uuid"></key-value>
  <key-value uuid=${this.uuid} key-name="Name" .value="${object.name}" type="string" property="name"></key-value>
  <key-value uuid=${this.uuid} key-name="Matrix Auto Update" .value="${!(object.matrixAutoUpdate === false)}" type="boolean" property="matrixAutoUpdate"></key-value>
  <key-value uuid=${this.uuid} key-name="Render Order" .value="${object.renderOrder || 0}" type="number" property="renderOrder"></key-value>
  <key-value uuid=${this.uuid} key-name="Visible" .value="${!(object.visible === false)}" type="boolean" property="visible"></key-value>
  <key-value uuid=${this.uuid} key-name="Receive Shadow" .value="${object.receiveShadow || false}" property="receiveShadow" type="boolean"></key-value>
  <key-value uuid=${this.uuid} key-name="Cast Shadow" .value="${object.castShadow || false}" type="boolean" property="castShadow"></key-value>
  <key-value uuid=${this.uuid} key-name="Frustum Culled" .value="${!(object.frustumCulled === false)}" type="boolean" property="frustumCulled"></key-value>

  <key-value uuid=${this.uuid} class="mesh" key-name="Material" .value="${object.material}" type="material" property="material"></key-value>
  <key-value class="mesh" uuid=${this.uuid} key-name="Geometry" .value="${object.geometry}" type="geometry" property="geometry"></key-value>
  <key-value class="mesh" uuid=${this.uuid} key-name="Draw Mode" .value="${object.drawMode || 0}" type="enum" property="drawMode"></key-value>
</div>
`;
  }
}
