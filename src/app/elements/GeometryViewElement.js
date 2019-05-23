import BaseElement, { html } from './BaseElement.js';

export default class GeometryViewElement extends BaseElement {
  static get typeHint() { return 'geometry'; }
  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  render() {
    const geometry = this.getEntity();

    if (!geometry) {
      return html`<div>no geometry</div>`;
    }

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  .properties {
    height: auto;
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
<title-bar title="Geometry View"></title-bar>
<div class="properties">
  <div>TODO</div>
  <key-value uuid="${this.uuid}" key-name="UUID" .value="${geometry.uuid}" type="string" property="uuid"></key-value>
  <key-value uuid="${this.uuid}" key-name="Type" .value="${geometry.type}" type="string" property="type"></key-value>
</div>
`;
  }
}
