import { LitElement, html } from '../../../web_modules/lit-element.js'
import ContentBridge from '../ContentBridge.js';

const $onSelectObject = Symbol('onSelectObject');
const $onContentUpdate = Symbol('onContentUpdate');
const $onContentConnect = Symbol('onContentConnect');

export default class AppElement extends LitElement {
  static get properties() {
    return {
      activeScene: { type: String, reflect: true, attribute: 'active-scene' },
      activeObject: { type: String, reflect: true, attribute: 'active-object' },
    }
  }


  constructor() {
    super();

    this[$onSelectObject] = this[$onSelectObject].bind(this);
    this[$onContentUpdate] = this[$onContentUpdate].bind(this);
    this[$onContentConnect] = this[$onContentConnect].bind(this);
    this.content = new ContentBridge();

    this.content.addEventListener('update', this[$onContentUpdate]);
    this.content.addEventListener('connect', this[$onContentConnect]);
  }

  refresh(uuid, typeHint) {
    this.content.refresh(uuid, typeHint);
  }

  /**
   * Lifecycle methods
   */

  /**
   * On connect, setup the initial views
   */
  async connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    this.addEventListener('select-object', this[$onSelectObject]);
    this.content.connect();
  }

  disconnectedCallback() {
    this.removeEventListener('select-object', this[$onSelectObject]);
    super.disconnectedCallback && super.disconnectedCallback();
  }

  shouldUpdate(changedProps) {
    console.log(changedProps);
    if (changedProps.has('activeObject')) {
      this.content.select(this.activeObject);
    }

    return true;
  }

  render() {

    let inspected;

    if (this.activeObject) {
      const object = this.content.get(this.activeObject);

      if (object) {
        switch (object.typeHint) {
          case 'texture':
            inspected = html`<texture-view uuid=${this.activeObject}></texture-view>`;
            break;
          case 'material':
            inspected = html`<material-view uuid=${this.activeObject}></material-view>`;
            break;
          case 'object':
          default:
            inspected = html`<object-view uuid=${this.activeObject}></object-view>`;
            break;
        }
      } else {
        console.log('could not find activeObject', this.activeObject);
      }
    }

    console.log("RENDER AppElement");
    return html`
<style>
  :host {
    display: flex;
    width: 100%;
    height: 100%;
  }

  :host > * {
    flex: 1;
  }

  scene-view {
    overflow-y: auto;
    overflow-x: hidden;
  }
</style>
<scene-view uuid="${this.activeScene}" .selected="${this.activeObject}"
    ></scene-view>
${inspected}
`;
  }

  [$onSelectObject](e) {
    this.activeObject = e.detail.uuid || null;
  }

  [$onContentUpdate](e) {
    // If this is the initial scene, set it as active
    if (!this.activeScene && e.detail.typeHint === 'scene') {
      this.activeScene = e.detail.uuid;
    }
  }

  // Fired when content is initially loaded
  [$onContentConnect](e) {
    this.activeScene = null;
    this.activeObject = null;
  }
}
