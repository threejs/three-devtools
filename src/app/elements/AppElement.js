import { LitElement, html } from '../../../web_modules/lit-element.js'
import { ifDefined } from '../../../web_modules/lit-html/directives/if-defined.js';
import ContentBridge from '../ContentBridge.js';

const $onPresetClick = Symbol('onPresetClick');
const $onSelectScene = Symbol('onSelectScene');
const $onSelectEntity = Symbol('onSelectEntity');
const $onSelectRenderer = Symbol('onSelectRenderer');
const $onContentUpdate = Symbol('onContentUpdate');
const $onContentLoad = Symbol('onContentLoad');
const $onContentError = Symbol('onContentError');
const $onContentRendererUpdate = Symbol('onContentRendererUpdate');
const $onCommand = Symbol('onCommand');

export default class AppElement extends LitElement {
  static get properties() {
    return {
      // scene, geometry, material, texture, rendering
      preset: { type: String, },
      errorText: { type: String, },
      activeScene: { type: String, reflect: true, attribute: 'active-scene' },
      activeEntity: { type: String, reflect: true, attribute: 'active-entity' },
      activeRenderer: { type: String, reflect: true, attribute: 'active-renderer' },
      needsReload: { type: Boolean, reflect: true, attribute: 'needs-reload' },
    }
  }


  constructor() {
    super();

    this.needsReload = true;
    this.preset = 'scene';

    this[$onSelectScene] = this[$onSelectScene].bind(this);
    this[$onSelectEntity] = this[$onSelectEntity].bind(this);
    this[$onContentUpdate] = this[$onContentUpdate].bind(this);
    this[$onContentLoad] = this[$onContentLoad].bind(this);
    this[$onContentError] = this[$onContentError].bind(this);
    this[$onContentRendererUpdate] = this[$onContentRendererUpdate].bind(this);
    this[$onCommand] = this[$onCommand].bind(this);
    this.content = new ContentBridge();

    this.content.addEventListener('update', this[$onContentUpdate]);
    this.content.addEventListener('load', this[$onContentLoad]);
    this.content.addEventListener('renderer-update', this[$onContentRendererUpdate]);
    this.content.addEventListener('error', this[$onContentError]);
    this.addEventListener('command', this[$onCommand]);
  }

  setError(error) {
    this.errorText = error;
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

  firstUpdated() {
    this.content.setPreset(this.preset);
  }

  render() {
    const isReady = !!this.activeScene;
    // scene, geometry, material, texture, rendering
    const preset = this.preset || 'scene';
    const errorText = this.errorText || '';
    const showResourceView = ['geometry', 'material', 'texture'].indexOf(preset) !== -1;
    const showInspector = this.activeEntity && this.preset !== 'rendering';
    //const object = this.content.get(this.activeEntity);

    return html`
<style>
  :host {
    width: 100%;
    height: 100%;
  }

  /* Vertical */

  #container {
    width: 100%;
    height: 100%;
    user-select: none;
  }
  #container > * {
    border-top: 1px solid var(--view-border-color);
    border-left: 0px;
  }
  #container > devtools-message {
    border: 0px;
  }
  #container > tab-bar {
    border: 0px;
  }
  .flex {
    display: flex;
    flex-direction: column;
  }
  .flex > * {
    flex: 1;
    overflow: hidden;
  }
  .flex.inverse {
    flex-direction: row;
  }
  .collapsible {
    flex: 0 1 auto;
  }

  .inspector-frame {
    max-height: 50%;
    flex: 0 1 auto;
  }
  .inspector-frame[show-inspector] {
    flex: 1;
  }

  /* @TODO turn these into generic flex components? */
  .frame > * {
    display: none;
  }
  .frame > [enabled] {
    display: inherit;
  }

  /* Horizontal frames */

  @media (min-aspect-ratio: 1/1) {
    .flex {
      flex-direction: row;
    }
    .flex.inverse {
      flex-direction: column;
    }
    #container > * {
      border-left: 1px solid var(--view-border-color);
      border-top: 0px;
    }
    tab-bar {
      flex-direction: column;
      height: 100%;
    }
    .inspector-frame {
      max-height: 100%;
      max-width: 50%;
    }
  }

  .error {
    background-color: red;
    position: absolute;
    bottom: 0;
    color: white;
    width: 100%;
    display: none;
  }
  .show-error {
    display: block;
  }

  /* Animations and visibility handling */

  [state] [visible-when] {
    display: none;
  }
  [state='ready'] [visible-when='ready'] {
    display: inherit;
  }
  [state='needs-reload'] [visible-when='needs-reload'] {
    display: inherit;
  }
  [state='waiting'] [visible-when='waiting'] {
    display: inherit;
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
<div class="flex" state=${isReady ? 'ready' : this.needsReload ? 'needs-reload' : 'waiting'} id="container">
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
  <tab-bar class="flex inverse collapsible" visible-when='ready' @click=${this[$onPresetClick]}>
    <x-icon class="collapsible" title="Scene" ?active=${preset === 'scene'} icon="cubes" fill></x-icon>
    <x-icon class="collapsible" title="Geometries" ?active=${preset === 'geometry'} icon="dice-d20" fill></x-icon>
    <x-icon class="collapsible" title="Materials" ?active=${preset === 'material'} icon="paint-brush" fill></x-icon>
    <x-icon class="collapsible" title="Textures" ?active=${preset === 'texture'} icon="chess-board" fill></x-icon>
    <x-icon class="collapsible" title="Rendering" ?active=${preset === 'rendering'} icon="video" fill></x-icon>
  </tab-bar>

  <div class="frame flex" visible-when='ready'> 
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
  <div ?show-inspector=${showInspector} class="inspector-frame frame flex inverse"
    visible-when='ready'>
      <parameters-view ?enabled=${showInspector}
        uuid="${this.activeEntity}">
      </parameters-view>
  </div>
  <title-bar title="${errorText}" class="error ${errorText ? 'show-error' : ''}"></title-bar>
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
    this.content.setPreset(this.preset);
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
    if (!this.activeScene && this.content.getEntityCategory(e.detail.uuid) === 'scenes') {
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

  [$onContentError](e) {
    this.setError(e.detail);
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
