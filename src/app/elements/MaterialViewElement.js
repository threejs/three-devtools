import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';

export default class MaterialViewElement extends BaseElement {
  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  constructor() {
    super();

  }

  render() {
    const object = this.app.getObject(this.uuid);

    if (!object) {
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
<title-bar>Material View</title-bar>
<div class="properties">
  <key-value key-name="Type" value="${object.type}" type="string"></key-value>
  <key-value key-name="UUID" value="${object.uuid}" type="string"></key-value>
  <key-value key-name="Color" value="${object.color}" type="color"></key-value>
  <key-value key-name="Depth Func" value="${object.depthWrite}" type="number"></key-value>
  <key-value key-name="Depth Test" value="${object.depthTest}" type="boolean"></key-value>
  <key-value key-name="Depth Write" value="${object.depthWrite}" type="boolean"></key-value>
  <key-value key-name="Emissive" value="${object.emissive}" type="color"></key-value>
  <key-value key-name="Environment Map" value="${object.envMap}" type="texture"></key-value>
  <key-value key-name="Environment Intensity" value="${object.envMapIntensity}" type="number"></key-value>
  <key-value key-name="Metalness" value="${object.metalness}" type="number"></key-value>
  <key-value key-name="Roughness" value="${object.roughness}" type="number"></key-value>
</div>
`;
  }
}
