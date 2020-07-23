import { LitElement, html } from '../../../web_modules/lit-element.js'

const $onPoll = Symbol('onPoll');
const RENDERER_POLL_INTERVAL = 1000; // ms

export default class RendererViewElement extends LitElement {
  static get properties() {
    return {
      rendererId: { type: String, },
      renderingInfo: { type: Object, },
      enabled: { type: Boolean, reflect: true },
    };
  }

  constructor() {
    super();
    this[$onPoll] = this[$onPoll].bind(this);
  }

  disconnectedCallback() {
    if (this[$onPoll].timer) {
      window.clearInterval(this[$onPoll].timer);
    }
    super.disconnectedCallback();
  }

  [$onPoll]() {
    if (this.rendererId) {
      this.dispatchEvent(new CustomEvent('command', {
        detail: {
          type: 'request-rendering-info',
          uuid: this.rendererId,
        },
        bubbles: true,
        composed: true,
      }));
    }
  }

  shouldUpdate(props) {
    if (props.has('enabled')) {
      if (this.enabled) {
        this[$onPoll].timer = window.setInterval(this[$onPoll], RENDERER_POLL_INTERVAL); 
      } else {
        window.clearInterval(this[$onPoll].timer);
      }
    }
    return true;
  }

  render() {
    const activeRenderer = this.rendererId;
    const hasRenderingInfo = !!this.renderingInfo;

    const info = hasRenderingInfo ? this.renderingInfo.info : {
      render: {
        frame: 0,
        calls: 0,
        triangles: 0,
        points: 0,
        lines: 0,
      },
      memory: {
        geometry: 0,
        textures: 0,
      }
    };

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
    box-sizing: border-box;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    display: none;
  }
  .properties td:last-child {
    text-align: right;
  }
  .properties.show-render-data {
    display: table;
  }
</style>
<title-bar title="Renderer"></title-bar>
<table class="properties${hasRenderingInfo ? ' show-render-data' : ''}">
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
