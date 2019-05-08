import { LitElement, html } from '../../../web_modules/lit-element.js'
import { getObjectByUUID } from '../utils.js';

export default class ThreeDevtoolsAppElement extends LitElement {

  constructor() {
    super();

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

    this.currentScene = null;
    this.port.onMessage.addListener(request => {
      const { id, type, data } = request;

      switch (type) {
        case 'data':
          const uuid = data.object.uuid;
          const object = data.object;

          if (!this.currentScene && object.type === 'Scene') {
            this.currentScene = object;
            console.log('emitting select-scene');
            this.dispatchEvent(new CustomEvent('select-scene', {
              detail: {
                object,
                uuid,
              },
            }));
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
    if (!object && this.currentScene) {
      // If no object, check current scene
      // @TODO should the children's be observables as well?
      object = getObjectByUUID(this.currentScene, uuid);
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
    // Flush all observed objects on initialization
    chrome.devtools.inspectedWindow.eval('__THREE_DEVTOOLS__.flush()');
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
  }

  update(changedProperties) {
    super.update(changedProperties);
  }

  render() {
    console.log('render app!');
    return html`
<style>
  :host, #container {
    display: block;
    width: 100%;
    height: 100%;
  }

  #container {
    display: flex;
    width: 100%;
    height: 100%;
  }
  
</style>
<div id="container">
  <slot></slot>
</div>
`;
  }
}
