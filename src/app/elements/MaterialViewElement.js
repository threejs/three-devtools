import BaseElement, { html } from './BaseElement.js';

export default class MaterialViewElement extends BaseElement {
  static get typeHint() { return 'material'; }
  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  constructor() {
    super();

  }

  render() {
    const material = this.getEntity();

    if (!material) {
      return html`<div>no material</div>`;
    }

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
<title-bar title="Material View"></title-bar>
<div class="properties">
  <key-value uuid="${this.uuid}" key-name="Type" .value="${material.type}" type="string" property="type"></key-value>
  <key-value uuid="${this.uuid}" key-name="UUID" .value="${material.uuid}" type="string" property="uuid"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Color" .value="${material.color}" type="color" property="color"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Depth Func" .value="${material.depthFunc}" type="number" property="depthFunc"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Depth Test" .value="${material.depthTest}" type="boolean" property="depthTest"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Depth Write" value="${material.depthWrite}" type="boolean" property="depthWrite"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Emissive" value="${material.emissive}" type="color" property="emissive"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Environment Map" value="${material.envMap}" type="texture" property="envMap"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Environment Intensity" value="${material.envMapIntensity}" type="number" property="envMapIntensity"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Metalness" value="${material.metalness}" type="number" property="metalness"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Roughness" value="${material.roughness}" type="number" property="roughness"></key-value>
</div>
`;
  }
}
