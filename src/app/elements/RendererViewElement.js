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
  }

  .properties {
    flex: 1;
    font-size: 1em;
    padding: 4px 6px;
    box-sizing: border-box;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .properties td:last-child {
    text-align: right;
  }
</style>
<title-bar title="Renderer"></title-bar>
<table class="properties">
  <tbody>
    <tr>
      <td>frame</td><td>${info.render.frame}</td>
    </tr>
    <tr>
      <td>calls</td><td>${info.render.calls}</td>
    </tr>
    <tr>
      <td>triangles</td><td>${info.render.triangles}</td>
    </tr>
    <tr>
      <td>points</td><td>${info.render.points}</td>
    </tr>
    <tr>
      <td>lines</td><td>${info.render.lines}</td>
    </tr>
    <tr>
      <td>geometries</td><td>${info.memory.geometries}</td>
    </tr>
    <tr>
      <td>textures</td><td>${info.memory.textures}</td>
    </tr>
  </tbody>
</table>
`;
  }
}
