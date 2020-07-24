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
        geometries: 0,
        textures: 0,
      },
      programs: 0,
    };

    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  /* quick hack, need to rethink title components */
  title-bar[title="Memory"] {
    border-top: 1px solid var(--title-border-color);
  }
  ul {
    list-style-type: none;
    padding-left: 0.8em;
    margin: 0.4em 0;
  }
  ul li {
    margin: 0.2em 0;
  }
  ul li span:first-child {
    font-weight: bold;
    padding-right: 0.5em;
  }
  ul li span:first-child::after {
    content: ':';
  }
</style>
<title-bar title="Renderer"></title-bar>
<ul>
  <li><span>frame</span><span>${info.render.frame}</span></li>
  <li><span>draw calls</span><span>${info.render.calls}</span></li>
  <li><span>triangles</span><span>${info.render.triangles}</span></li>
  <li><span>points</span><span>${info.render.points}</span></li>
  <li><span>lines</span><span>${info.render.lines}</span></li>
</ul>

<title-bar title="Memory"></title-bar>

<ul>
  <li><span>geometries</span><span>${info.memory.geometries || 0}</span></li>
  <li><span>textures</span><span>${info.memory.textures || 0}</span></li>
  <li><span>programs</span><span>${info.programs || 0}</span></li>
</ul>
`;
  }
}
