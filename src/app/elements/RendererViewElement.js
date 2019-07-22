import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';

const $onRendererUpdate = Symbol('onRendererUpdate');
const $onPoll = Symbol('onPoll');
const RENDERER_POLL_INTERVAL = 1000; // ms

export default class RendererViewElement extends BaseElement {
  // Note that BaseElement is only used for the `app.content`
  // connection, not the auto-updating via UUID.
  static get properties() {
    return {
      id: { type: String, reflect: true },
    };
  }

  constructor() {
    super();
    this[$onPoll] = this[$onPoll].bind(this);
    this[$onRendererUpdate] = this[$onRendererUpdate].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.app.content.addEventListener('renderer-update', this[$onRendererUpdate]);
    this[$onPoll].timer = window.setInterval(this[$onPoll], RENDERER_POLL_INTERVAL);
  }
  disconnectedCallback() {
    window.clearInterval(this[$onPoll].timer);
    this.app.content.removeEventListener('renderer-update', this[$onRendererUpdate]);
    super.disconnectedCallback();
  }

  [$onPoll]() {
    if (this.id) {
      this.app.content.refresh(this.id);
    }
  }

  [$onRendererUpdate](e) {
    if (this.id && e.detail.info && e.detail.id === this.id) {
      this.requestUpdate();
    }
  }

  render() {
    const renderer = this.app.content.getRenderer(this.id);

    if (!renderer || !renderer.info) {
      return html`<div>no renderer</div>`;
    }

    const info = renderer.info;

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
