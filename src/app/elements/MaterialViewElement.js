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
  <key-value key-name="Type" value="${material.type}" type="string"></key-value>
  <key-value key-name="UUID" value="${material.uuid}" type="string"></key-value>
  <key-value editable key-name="Color" value="${material.color}" type="color"></key-value>
  <key-value editable key-name="Depth Func" value="${material.depthFunc}" type="number"></key-value>
  <key-value editable key-name="Depth Test" value="${material.depthTest}" type="boolean"></key-value>
  <key-value editable key-name="Depth Write" value="${material.depthWrite}" type="boolean"></key-value>
  <key-value editable key-name="Emissive" value="${material.emissive}" type="color"></key-value>
  <key-value editable key-name="Environment Map" value="${material.envMap}" type="texture"></key-value>
  <key-value editable key-name="Environment Intensity" value="${material.envMapIntensity}" type="number"></key-value>
  <key-value editable key-name="Metalness" value="${material.metalness}" type="number"></key-value>
  <key-value editable key-name="Roughness" value="${material.roughness}" type="number"></key-value>
</div>
`;
  }
}
