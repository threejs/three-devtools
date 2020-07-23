import { LitElement, html } from '../../../web_modules/lit-element.js'
import { ifDefined } from '../../../web_modules/lit-html/directives/if-defined.js';
import ContentBridge from '../ContentBridge.js';

const ERROR_TIMEOUT = 5000;

const $onPanelClick = Symbol('onPanelClick');
const $onContentUpdate = Symbol('onContentUpdate');
const $onContentLoad = Symbol('onContentLoad');
const $onContentError = Symbol('onContentError');
const $onCommand = Symbol('onCommand');

const panels = {
  scene: {
    title: 'Scene',
    resource: 'scenes',
  },
  geometries: {
    title: 'Geometries',
    resource: 'geometries',
  },
  materials: {
    title: 'Materials',
    resource: 'materials',
  },
  textures: {
    title: 'Textures',
    resource: 'textures',
  },
  rendering: {
    title: 'Rendering',
  },
};

export default class AppElement extends LitElement {
  static get properties() {
    return {
      errorText: { type: String, },
      needsReload: { type: Boolean, },
      isReady: { type: Boolean },
      // scene, geometries, materials, textures, rendering
      panel: { type: String, },
      activeScene: { type: String, },
      activeEntity: { type: String, },
      activeRenderer: { type: String, },
    }
  }


  constructor() {
    super();

    this.needsReload = true;
    this.isReady = false;
    this.panel = 'scene';

    this[$onPanelClick] = this[$onPanelClick].bind(this);
    this[$onContentUpdate] = this[$onContentUpdate].bind(this);
    this[$onContentLoad] = this[$onContentLoad].bind(this);
    this[$onContentError] = this[$onContentError].bind(this);
    this[$onCommand] = this[$onCommand].bind(this);
    this.content = new ContentBridge();

    this.content.addEventListener('load', this[$onContentLoad]);
    this.content.addEventListener('error', this[$onContentError]);
    this.content.addEventListener('rendering-info-update', this[$onContentUpdate]);
    this.content.addEventListener('entity-update', this[$onContentUpdate]);
    this.content.addEventListener('renderer-update', this[$onContentUpdate]);
    this.content.addEventListener('scene-graph-update', this[$onContentUpdate]);
    this.content.addEventListener('overview-update', this[$onContentUpdate]);
    this.content.addEventListener('observe', this[$onContentUpdate]);
    this.addEventListener('command', this[$onCommand]);
  }

  setError(error) {
    if (this.errorTimeout) {
      window.clearTimeout(this.errorTimeout);
    }
    this.errorText = error;
    this.errorTimeout = window.setTimeout(() => {
      this.errorText = '';
      this.errorTimeout = null;
    }, ERROR_TIMEOUT);
  }

  shouldUpdate(changedProps) {
    if (changedProps.has('activeEntity') && this.activeEntity) {
      this.content.select(this.activeEntity);
      this.content.requestEntity(this.activeEntity);
    }
    if (changedProps.has('activeScene') && this.activeScene) {
      this.content.requestSceneGraph(this.activeScene);
    }
    if (changedProps.has('panel') ||
        (changedProps.has('isReady') && this.isReady)) {
      this.refreshData();
    }

    return true;
  }

  createRenderRoot() {
    // Is this necessary?
    return this;
  }

  /**
   * Request fresh data for all active views
   */
  refreshData(config={}) {
    const panelDef = panels[this.panel];
    if (panelDef && panelDef.resource) {
      this.content.requestOverview(panelDef.resource);
    }
    if (this.activeScene && this.panel === 'scene') {
      this.content.requestSceneGraph(this.activeScene);
    }
    if (config.activeEntity !== false && this.activeEntity && this.panel !== 'rendering') {
      this.content.requestEntity(this.activeEntity);
    }
    if (this.panel === 'rendering' && this.activeRenderer) {
      this.content.requestEntity(this.activeRenderer);
    }
  }

  /**
   * UI Event Handlers
   */

  [$onPanelClick](e) {
    this.panel = e.target.getAttribute('panel');
  }

  /**
   * Content Event Handlers
   */

  [$onContentUpdate](e) {
    switch(e.type) {
      case 'observe':
        // New scenes have been added
        this.isReady = true;

        // Set the first renderer if none selected
        const renderer = e.detail.uuids.find(id => /renderer/.test(id));
        if (!this.activeRenderer && renderer) {
          this.activeRenderer = renderer;
        }
        this.refreshData({ activeEntity: false });
        break;
      case 'rendering-info-update':
        // If renderer data was returned and viewing on the rendering panel, rerender
        if (this.panel === 'rendering' && this.activeRenderer === e.detail.uuid) {
          this.requestUpdate();
        }
        break;
      case 'entity-update':
        // @TODO figure out when this should be updated
        this.requestUpdate();
        break;
      case 'renderer-update':
        if (this.panel === 'rendering' && this.activeRenderer === e.detail.uuid) {
          this.requestUpdate();
        }
        break;
      case 'scene-graph-update':
        if (this.panel === 'scene' && this.activeScene === e.detail.uuid) {
          this.requestUpdate();
        }
        break;
      case 'overview-update':
        // Set the first scene if none selected
        if (!this.activeScene && e.detail.type === 'scenes' && e.detail.entities[0]) {
            this.activeScene = e.detail.entities[0].uuid;
        }
        // If an overview was updated and currently being displayed, rerender
        else if (this.panel && panels[this.panel].resource === e.detail.type) {
          this.requestUpdate();
        }
        break;
    }
  }

  // Fired when content is initially loaded
  [$onContentLoad](e) {
    this.activeScene = undefined;
    this.activeEntity = undefined;
    this.activeRenderer = undefined;
    this.isReady = false;
    this.needsReload = false;
  }

  [$onContentError](e) {
    this.setError(e.detail);
  }

  /**
   * API for Components Event Handlers
   */
  [$onCommand](e) {
    const { type } = e.detail;

    switch (type) {
      case 'refresh':
        this.refreshData();
        break;
      case 'select-scene':
        this.activeScene = e.detail.uuid;
        break;
      case 'select-entity':
        this.activeEntity = e.detail.uuid;
        break;
      case 'select-renderer':
        this.activeRenderer = e.detail.id;
        break;
      case 'select-panel':
        this.panel = e.detail.panel;
        break;
      case 'request-entity':
        this.content.requestEntity(e.detail.uuid);
        break;
      case 'request-overview':
        this.content.requestOverview(e.detail.resourceType);
        break;
      case 'request-scene-graph':
        this.content.requestSceneGraph(e.detail.uuid);
        break;
      case 'request-rendering-info':
        this.content.requestRenderingInfo(e.detail.uuid);
        break;
      case 'update-property':
        const { uuid, property, value, dataType } = e.detail;
        this.content.updateProperty(uuid, property, value, dataType);
        break;
      default:
        console.warn(`Unknown command ${type}`);
    }
  }

  render() {
    const panel = this.panel || 'scene';
    const panelDef = panels[panel];
    const errorText = this.errorText || '';

    const graph = panel === 'scene' && this.activeScene ? this.content.getSceneGraph(this.activeScene) : void 0;
    const scenes = panel === 'scene' && this.activeScene ? this.content.getResourcesOverview('scenes') : void 0;
    const showResourceView = !!(panelDef.resource && panel !== 'scene');
    const resources = showResourceView ? this.content.getResourcesOverview(panelDef.resource) : [];

    const showInspector = panel === 'rendering' ? (!!this.activeRenderer) : (!!this.activeEntity);
    const inspectedEntity = panel === 'rendering' ? this.activeRenderer : this.activeEntity;
    const inspectedEntityData = showInspector ? this.content.getEntityAndDependencies(inspectedEntity) : void 0;

    const renderingInfo = panel === 'rendering' && this.activeRenderer ? this.content.getRenderingInfo(this.activeRenderer) : void 0;

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
<div class="flex" state=${this.isReady ? 'ready' : this.needsReload ? 'needs-reload' : 'waiting'} id="container">
  <!-- Reload panes -->
  <devtools-message visible-when='needs-reload'>
    <span>Three Devtools requires a page reload.</span>
    <devtools-button @click="${() => this.content.reload()}">
      <span>Reload</span>
    </devtools-button>
  </devtools-message>
  <devtools-message visible-when='waiting'>
    <span>Waiting for a scene to be observed...</span>
    <span class="loading">▲</span>
  </devtools-message>

  <!-- Application panes -->
  <tab-bar class="flex inverse collapsible" visible-when='ready' @click=${this[$onPanelClick]}>
    <x-icon class="collapsible" panel="scene" title="${panels.scene.title}" ?active=${panel === 'scene'} icon="cubes" fill></x-icon>
    <x-icon class="collapsible" panel="geometries" title="${panels.geometries.title}" ?active=${panel === 'geometries'} icon="dice-d20" fill></x-icon>
    <x-icon class="collapsible" panel="materials" title="${panels.materials.title}" ?active=${panel === 'materials'} icon="paint-brush" fill></x-icon>
    <x-icon class="collapsible" panel="textures" title="${panels.textures.title}" ?active=${panel === 'textures'} icon="chess-board" fill></x-icon>
    <x-icon class="collapsible" panel="rendering" title="${panels.rendering.title}" ?active=${panel === 'rendering'} icon="video" fill></x-icon>
  </tab-bar>

  <div class="frame flex" visible-when='ready'> 
    <scene-view
      .graph="${graph}"
      .scenes="${scenes}"
      .activeScene="${ifDefined(this.activeScene)}"
      .activeEntity="${ifDefined(this.activeEntity)}"
      ?enabled=${panel === 'scene'}
      ></scene-view>
    <resources-view
      title="${panelDef.title}"
      selected="${ifDefined(this.activeEntity)}"
      .resources="${resources}"
      ?enabled=${showResourceView}
      ></resources-view>
    <renderer-view
      .rendererId="${this.activeRenderer}"
      .renderingInfo="${renderingInfo}"
      ?enabled=${panel === 'rendering'}
      ></renderer-view>
  </div>
  <div ?show-inspector=${showInspector} class="inspector-frame frame flex inverse"
    visible-when='ready'>
      <parameters-view ?enabled=${showInspector}
        .uuid="${inspectedEntity}"
        .entities="${inspectedEntityData}">
      </parameters-view>
  </div>
  <title-bar title="${errorText}" class="error ${errorText ? 'show-error' : ''}"></title-bar>
</div>
`;
  }
}
