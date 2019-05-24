import { LitElement, html } from '../../../web_modules/lit-element.js'
import { ifDefined } from '../../../web_modules/lit-html/directives/if-defined.js';
import ContentBridge from '../ContentBridge.js';

const $onSelectScene = Symbol('onSelectScene');
const $onSelectEntity = Symbol('onSelectEntity');
const $onSelectRenderer = Symbol('onSelectRenderer');
const $onContentUpdate = Symbol('onContentUpdate');
const $onContentLoad = Symbol('onContentLoad');
const $onContentRendererUpdate = Symbol('onContentRendererUpdate');
const $onCommand = Symbol('onCommand');

export default class AppElement extends LitElement {
  static get properties() {
    return {
      activeScene: { type: String, reflect: true, attribute: 'active-scene' },
      activeEntity: { type: String, reflect: true, attribute: 'active-entity' },
      activeRenderer: { type: String, reflect: true, attribute: 'active-renderer' },
    }
  }


  constructor() {
    super();

    this[$onSelectScene] = this[$onSelectScene].bind(this);
    this[$onSelectEntity] = this[$onSelectEntity].bind(this);
    this[$onContentUpdate] = this[$onContentUpdate].bind(this);
    this[$onContentLoad] = this[$onContentLoad].bind(this);
    this[$onContentRendererUpdate] = this[$onContentRendererUpdate].bind(this);
    this[$onCommand] = this[$onCommand].bind(this);
    this.content = new ContentBridge();

    this.content.addEventListener('update', this[$onContentUpdate]);
    this.content.addEventListener('load', this[$onContentLoad]);
    this.content.addEventListener('renderer-update', this[$onContentRendererUpdate]);
    this.addEventListener('command', this[$onCommand]);
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
    this.addEventListener('select-scene', this[$onSelectScene]);
    this.addEventListener('select-entity', this[$onSelectEntity]);
    this.addEventListener('select-renderer', this[$onSelectRenderer]);
    this.content.connect();
  }

  disconnectedCallback() {
    this.removeEventListener('select-scene', this[$onSelectScene]);
    this.removeEventListener('select-entity', this[$onSelectEntity]);
    this.removeEventListener('select-renderer', this[$onSelectRenderer]);
    super.disconnectedCallback && super.disconnectedCallback();
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('activeEntity')) {
      // @TODO this selects it in the client which
      // refreshes the entity, while it's probably
      // being selected from this event as well, resulting
      // in multiple refreshes
      this.content.select(this.activeEntity);
    }

    return true;
  }

  render() {

    let inspected;

    if (this.activeEntity) {
      const object = this.content.get(this.activeEntity);

      if (object) {
        switch (object.typeHint) {
          case 'texture':
            inspected = html`<texture-view uuid="${this.activeEntity}"></texture-view>`;
            break;
          case 'material':
            inspected = html`<material-view uuid="${this.activeEntity}"></material-view>`;
            break;
          case 'geometry':
            inspected = html`<geometry-view uuid="${this.activeEntity}"></geometry-view>`;
            break;
          case 'object':
          default:
            inspected = html`<object-view uuid="${this.activeEntity}"></object-view>`;
            break;
        }
      } else {
        console.log('could not find activeEntity', this.activeEntity);
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
    overflow: hidden;
    border-top: 1px solid var(--view-border-color);
  }
  @media (min-aspect-ratio: 1/1) {
    :host > * {
      border-left: 1px solid var(--view-border-color);
    }
  }
  :host > *:first-child {
    border-left-width: 0px;
    border-top-width: 0px;
  }
  /* @TODO turn these into generic flex components? */
  .wrapper {
    display: flex;
    flex-direction: row;
  }
  .wrapper > * {
    flex: 1;
    border-left: 1px solid var(--view-border-color);
  }
  .wrapper > *:first-child {
    border-left-width: 0px;
  }
</style>
<div class="wrapper">
  <scene-view uuid="${ifDefined(this.activeScene)}"
      selected="${ifDefined(this.activeEntity)}"></scene-view>
  <resources-view uuid="${ifDefined(this.activeScene)}"
      selected="${ifDefined(this.activeEntity)}"></resources-view>
</div>
${inspected}
<div class="wrapper">
  <renderer-view id="${ifDefined(this.activeRenderer)}"
      selected="${ifDefined(this.activeRenderer)}"></renderer-view>
</div>
`;
  }
  
  [$onSelectScene](e) {
    this.activeScene = e.detail.uuid || undefined;
  }

  [$onSelectEntity](e) {
    this.activeEntity = e.detail.uuid || undefined;
  }

  [$onSelectRenderer](e) {
    this.activeRenderer = e.detail.id || undefined;
  }
  
  [$onContentUpdate](e) {
    // If this is the initial scene, set it as active
    if (!this.activeScene && e.detail.typeHint === 'scene') {
      this.activeScene = e.detail.uuid;
    }
  }
  
  [$onContentRendererUpdate](e) {
    // If this is the initial renderer, set it as active
    if (!this.activeRenderer && e.detail.id) {
      this.activeRenderer = e.detail.id;
    }
  }

  // Fired when content is initially loaded
  [$onContentLoad](e) {
    this.activeScene = undefined;
    this.activeEntity = undefined;
    this.activeRenderer = undefined;
  }
  
  /**
   * A command from a descendant node. Process here.
   */
  [$onCommand](e) {
    const { type } = e.detail;

    switch (type) {
      case 'update-property':
        const { uuid, property, value, dataType } = e.detail;
        this.content.updateProperty(uuid, property, value, dataType);
        break;
    }
  }
}
