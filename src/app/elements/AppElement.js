import { LitElement, html } from '../../../web_modules/lit-element.js'
import { ifDefined } from '../../../web_modules/lit-html/directives/if-defined.js';
import ContentBridge from '../ContentBridge.js';

const $onPresetClick = Symbol('onPresetClick');
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
      // scene, geometry, material, texture, rendering
      preset: { type: String, },
      activeScene: { type: String, reflect: true, attribute: 'active-scene' },
      activeEntity: { type: String, reflect: true, attribute: 'active-entity' },
      activeRenderer: { type: String, reflect: true, attribute: 'active-renderer' },
      needsReload: { type: Boolean, reflect: true, attribute: 'needs-reload' },
    }
  }


  constructor() {
    super();

    this.needsReload = true;

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

  refresh(uuid) {
    this.content.refresh(uuid);
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

  createRenderRoot() {
    return this;
  }

  render() {

    let inspected;

    const isReady = this.activeScene && this.activeRenderer;
    // scene, geometry, material, texture, rendering
    const preset = this.preset || 'scene';
    const showResourceView = ['geometry', 'material', 'texture'].indexOf(preset) !== -1;
    if (this.activeEntity) {
      const object = this.content.get(this.activeEntity);

      if (object) {
        switch (object.typeHint) {
          case 'texture':
            inspected = html`<texture-view enabled uuid="${this.activeEntity}"></texture-view>`;
            break;
          case 'material':
            inspected = html`<material-view enabled uuid="${this.activeEntity}"></material-view>`;
            break;
          case 'geometry':
            inspected = html`<geometry-view enabled uuid="${this.activeEntity}"></geometry-view>`;
            break;
          case 'object':
          default:
            inspected = html`<object-view enabled uuid="${this.activeEntity}"></object-view>`;
            break;
        }
      } else {
        console.log('could not find activeEntity', this.activeEntity);
      }
    }

    return html`
<style>
  :host {
    width: 100%;
    height: 100%;
  }

  /* Vertical */

  #container {
    display: flex;
    width: 100%;
    height: 100%;
    flex-direction: column;
    user-select: none;
  }
  #container > * {
    flex: 1;
    overflow: hidden;
    border-top: 1px solid var(--view-border-color);
  }
  #container > devtools-message {
    border: 0px;
  }
  #container > tab-bar {
    flex: 0 1 auto;
    border: 0px;
  }
  tab-bar {
    flex-direction: row;
  }

  @media (min-aspect-ratio: 1/1) {
    #container {
      flex-direction: row;
    }
    #container > * {
      border-left: 1px solid var(--view-border-color);
      border-top: 0px;
    }
    tab-bar {
      flex-direction: column;
      height: 100%;
    }
  }

  /* @TODO turn these into generic flex components? */
  .frame > * {
    display: none;
  }
  .frame > [enabled] {
    display: inherit;
  }
  .frame {
    display: flex;
    flex-direction: row;
  }
  .frame > * {
    flex: 1;
  }
  .flex-inherit {
    flex: inherit !important;
  }

  [state] [visible-when] {
    display: none;
  }
  [state='ready'] [visible-when='ready'] {
    display: flex;
  }
  [state='needs-reload'] [visible-when='needs-reload'] {
    display: flex;
  }
  [state='waiting'] [visible-when='waiting'] {
    display: flex;
  }
  .loading {
    animation: loading 1s infinite;
  }
  @keyframes loading {
    from {
      transform: rotateY(0deg);
    }
    to {
      transform: rotateY(180deg);
    }
  }
</style>
<div state=${isReady ? 'ready' : this.needsReload ? 'needs-reload' : 'waiting'} id="container">
  <!-- Reload panes -->
  <devtools-message visible-when='needs-reload'>
    <span>Three Devtools requires a page reload.</span>
    <devtools-button @click="${() => this.content.reload()}">
      <span>Reload</span>
    </devtools-button>
  </devtools-message>
  <devtools-message visible-when='waiting'>
    <span>Waiting for a scene and renderer to be observed...</span>
    <span class="loading">▲</span>
  </devtools-message>

  <!-- Application panes -->
  <tab-bar visible-when='ready' @click=${this[$onPresetClick]}>
    <x-icon title="Scene" ?active=${preset === 'scene'} icon="cubes" fill></x-icon>
    <x-icon title="Geometries" ?active=${preset === 'geometry'} icon="dice-d20" fill></x-icon>
    <x-icon title="Materials" ?active=${preset === 'material'} icon="paint-brush" fill></x-icon>
    <x-icon title="Textures" ?active=${preset === 'texture'} icon="chess-board" fill></x-icon>
    <x-icon title="Rendering" ?active=${preset === 'rendering'} icon="video" fill></x-icon>
  </tab-bar>

  <div class="frame" visible-when='ready'> 
    <scene-view
      uuid="${ifDefined(this.activeScene)}"
      selected="${ifDefined(this.activeEntity)}"
      ?enabled=${preset === 'scene'}
      ></scene-view>
    <resources-view
      filter="${showResourceView ? preset : ''}"
      uuid="${ifDefined(this.activeScene)}"
      selected="${ifDefined(this.activeEntity)}"
      ?enabled=${showResourceView}
      ></resources-view>
    <renderer-view
      id="${ifDefined(this.activeRenderer)}"
      selected="${ifDefined(this.activeRenderer)}"
      ?enabled=${preset === 'rendering'}
      ></renderer-view>
  </div>
  <div class="frame" visible-when='ready'>
    ${inspected}
  </div>
</div>
`;
  }

  [$onPresetClick](e) {
    switch(e.target.title) {
      case 'Scene': this.preset = 'scene'; break;
      case 'Geometries': this.preset = 'geometry'; break;
      case 'Materials': this.preset = 'material'; break;
      case 'Textures': this.preset = 'texture'; break;
      case 'Rendering': this.preset = 'rendering'; break;
    }
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
    this.needsReload = false;
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
