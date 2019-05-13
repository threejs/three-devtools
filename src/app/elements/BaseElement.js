import { LitElement, html } from '../../../web_modules/lit-element.js'

const $onContentUpdate = Symbol('onContentUpdate');

export { html };

export default class BaseElement extends LitElement {

  static get properties() {
    return {
      uuid: {type: String, reflect: true}
    }
  }

  constructor() {
    super();
    this[$onContentUpdate] = this[$onContentUpdate].bind(this);
  }

  getEntity() {
    return this.app.content.get(this.uuid, this.constructor.typeHint);
  }

  connectedCallback() {
    super.connectedCallback && super.connectedCallback();
    let app = this.closest('three-devtools-app');

    // Looks like we can't pierce upwards outside of the shadow DOM?
    // Or we are getting callbacks fired when connected to an element outside
    // the DOM (e.g. `div -> tree-item` tree-item is getting connected callback,
    // but `div` its parent is disconnected).
    // Just query the entire page.
    if (!app) {
      app = document.querySelector('three-devtools-app');
    }

    if (!app) {
      throw new Error('BaseElement must be a child of <three-devtools-app>');
    }

    this.app = app;
    this.app.content.addEventListener('update', this[$onContentUpdate]);

    if (this.uuid) {
      this.app.refresh(this.uuid, this.constructor.typeHint);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback && super.disconnectedCallback();
    this.app.content.removeEventListener('update', this[$onContentUpdate]);
    this.app = null;
  }

  /**
   * If the UUID has changed, request the content for the latest
   * data.
   */
  shouldUpdate(changedProperties) {
    if (this.app && changedProperties.has('uuid')) {
      this.app.refresh(this.uuid, this.constructor.typeHint);
    }
    return true;
  }

  [$onContentUpdate](e) {
    // If the tracked object has been updated in
    // storage, force a rerender
    if (e.detail.uuid === this.uuid) {
      this.requestUpdate();
    }
  }
}
