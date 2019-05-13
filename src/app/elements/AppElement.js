import { LitElement, html } from '../../../web_modules/lit-element.js'
import Store from '../Store.js';

const $onSelectObject = Symbol('onSelectObject');
const $onStoreUpdate = Symbol('onStoreUpdate');
const $onStoreReset = Symbol('onStoreReset');

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
    this[$onStoreUpdate] = this[$onStoreUpdate].bind(this);
    this[$onStoreReset] = this[$onStoreReset].bind(this);
    this.store = new Store();

    this.store.addEventListener('update', this[$onStoreUpdate]);
    this.store.addEventListener('reset', this[$onStoreReset]);
  }

  refresh(uuid, typeHint) {
    this.store.refresh(uuid, typeHint);
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
    // Flush all observed objects on initialization
    this.store.reset();
  }

  disconnectedCallback() {
    this.removeEventListener('select-object', this[$onSelectObject]);
    super.disconnectedCallback && super.disconnectedCallback();
  }

  render() {

    let inspected;

    if (this.activeObject) {
      const object = this.store.get(this.activeObject);

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

  [$onStoreUpdate](e) {
    // If this is the initial scene, set it as active
    if (!this.activeScene && e.detail.typeHint === 'scene') {
      this.activeScene = e.detail.uuid;
    }
  }

  [$onStoreReset](e) {
    // Ping the content this.activeObject = e.detail.uuid;
    this.activeScene = null;
    this.activeObject = null;
    chrome.devtools.inspectedWindow.eval('ThreeDevTools.__connect()');
  }
}
