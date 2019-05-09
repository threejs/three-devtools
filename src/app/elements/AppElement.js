import { LitElement, html } from '../../../web_modules/lit-element.js'
import { getObjectByUUID } from '../utils.js';

const $onSelectObject = Symbol('onSelectObject');

export default class AppElement extends LitElement {
  static get properties() {
    return {
      activeScene: { type: String, reflect: true, attribute: 'active-scene' },
      activeObject: { type: String, reflect: true, attribute: 'active-object' },
      activeObjectType: { type: String, reflect: true, attribute: 'active-object-type' },
    }
  }


  constructor() {
    super();

    this[$onSelectObject] = this[$onSelectObject].bind(this);
    this.store = new Map();

    this.port = chrome.runtime.connect({
      name: 'three-devtools',
    });

    this.port.postMessage({
      name: 'connect',
      tabId: chrome.devtools.inspectedWindow.tabId,
    });

    this.port.onDisconnect.addListener(request => {
      console.log('disconnected from background');
    });

    this.port.onMessage.addListener(request => {
      const { id, type, data } = request;

      switch (type) {
        case 'data':
            console.log('received from client', data);
          const uuid = data.object.uuid;
          const object = data.object;

          if (object.type === 'Scene') {
            if (!this.activeScene) {
              this.activeScene = object.uuid;
            }

            // Also store all geometries, materials
            // @TODO Need to think more about the syncing story...
            data.geometries.forEach(geo => this.store.set(geo.uuid, geo));
            data.materials.forEach(mat => this.store.set(mat.uuid, mat));
          }

          this.store.set(uuid, object);

          this.dispatchEvent(new CustomEvent('store-update', {
            detail: {
              object,
              uuid,
            },
          }));
          break;
      }
    });
  }

  getObject(uuid) {
    let object = this.store.get(uuid);

    if (!object && this.activeScene) {
      // If no object, check current scene
      // @TODO should the children's be observables as well?
      object = getObjectByUUID(this.store.get(this.activeScene), uuid);
    }
    return object;
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
    chrome.devtools.inspectedWindow.eval('__THREE_DEVTOOLS__.flush()');
  }

  disconnectedCallback() {
    this.removeEventListener('select-object', this[$onSelectObject]);
    super.disconnectedCallback && super.disconnectedCallback();
  }

  update(changedProperties) {
    super.update(changedProperties);
  }

  render() {

    let inspected;

    if (this.activeObject) {
      switch (this.activeObjectType) {
        case 'material':
          inspected = html`<material-view uuid=${this.activeObject}></material-view>`;
          break;
        case 'object':
        default:
          inspected = html`<object-view uuid=${this.activeObject}></object-view>`;
          break;
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
</style>
<scene-view uuid="${this.activeScene}"></scene-view>
${inspected}
`;
  }

  [$onSelectObject](e) {
    this.activeObject = e.detail.uuid;
    this.activeObjectType = e.detail.type;
  }
}
