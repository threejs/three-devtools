import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';

const $onRendererInfoUpdate = Symbol('onRendererInfoUpdate');

export default class RendererViewElement extends BaseElement {
  // Note that BaseElement is only used for the `app.content`
  // connection, not the auto-updating via UUID.
  static get properties() {
    return [];
  }

  constructor() {
    super();
    this[$onRendererInfoUpdate] = this[$onRendererInfoUpdate].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.app.content.addEventListener('renderer-info', this[$onRendererInfoUpdate]);
  }
  disconnectedCallback() {
    this.app.content.removeEventListener('renderer-info', this[$onRendererInfoUpdate]);
    super.disconnectedCallback();
  }

  [$onRendererInfoUpdate](e) {
    this.requestUpdate();
  }

  render() {
    const info = this.app.content.getRendererInfo();

    console.log('render info view', info);
    if (!info) {
      return html`<div>no renderer</div>`;
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
<title-bar title="Renderer"></title-bar>
<ul class="properties">
  <li><strong>frame</strong>${info.render.frame}</li>
  <li><strong>calls</strong>${info.render.calls}</li>
  <li><strong>triangles</strong>${info.render.triangles}</li>
  <li><strong>points</strong>${info.render.points}</li>
  <li><strong>lines</strong>${info.render.lines}</li>
  <li><strong>geometries</strong>${info.memory.geometries}</li>
  <li><strong>textures</strong>${info.memory.textures}</li>
</ul>
`;
  }
}
