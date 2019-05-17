import { LitElement, html } from '../../../web_modules/lit-element.js'
import { objectTypeToCategory } from '../utils.js';

const $onContentUpdate = Symbol('onContentUpdate');
const $onTreeItemSelect = Symbol('onTreeItemSelect');

export default class ResourcesViewElement extends LitElement {
  static get properties() {
    return {
      selected: { type: Boolean, reflect: true },
      uuid: { type: String, reflect: true }, // Should this inherit from BaseElement?
    }
  }

  constructor() {
    super();
    this[$onTreeItemSelect] = this[$onTreeItemSelect].bind(this);
    this[$onContentUpdate] = this[$onContentUpdate].bind(this);

  }

  connectedCallback() {
    super.connectedCallback();
    // @TODO what's a better way of doing this
    this.app = document.querySelector('three-devtools-app');
    this.app.content.addEventListener('update', this[$onContentUpdate]);
    this.addEventListener('tree-item-select', this[$onTreeItemSelect]);
  }

  disconnectedCallback() {
    this.removeEventListener('tree-item-select', this[$onTreeItemSelect]);
    this.app.content.removeEventListener('update', this[$onContentUpdate]);
    this.app = null;
    super.disconnectedCallback();
  }

  [$onContentUpdate](e) {
    // If the tracked object has been updated in
    // storage, force a rerender
    this.requestUpdate();
  }

  render() {
    const resources = this.app.content.getAllResources();

    if (!resources && !this.uuid) {
      return html`<div>no resources</div>`;
    }

    console.log(resources);

    const createNode = (obj) => {
      let selected = obj.uuid && this.selected && this.selected === obj.uuid;
      return html`
      <tree-item
        ?selected="${selected}"
        depth="1"
        uuid="${obj.uuid}"
        type-hint="${obj.typeHint}"
      >
      <div slot="content">${obj.typeHint==='texture'?'<Texture>':(obj.name || obj.type)}</div>
      </tree-item>
      `;
    }

    const geometryNodes = resources.geometry ? resources.geometry.map(createNode) : [];
    const materialNodes = resources.material ? resources.material.map(createNode) : [];
    const textureNodes = resources.texture ? resources.texture.map(createNode): [];

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  :host > tree-item {
    height: auto;
    max-height: 100%;
  }

  font-awesome {
    color: #5a5a5a;
    padding-right: 5px;
  }
  tree-item[selected] > [slot='content'] > font-awesome {
    color: var(--tree-item-selected-color);
  }
</style>
<title-bar title="Resources"></title-bar>
<tree-item
  tabindex="0"
  root
  open
  depth="-1">

  <tree-item depth="0"
    ?show-arrow="${!!geometryNodes.length}">
    <div slot="content">
      <font-awesome type="fas" name="vector-square"></font-awesome>
      Geometry
    </div>
    ${geometryNodes}
  </tree-item>

  <tree-item depth="0"
    ?show-arrow="${!!materialNodes.length}">
    <div slot="content">
      <font-awesome type="fas" name="paint-roller"></font-awesome>
      Materials
    </div>
    ${materialNodes}
  </tree-item>

  <tree-item depth="0"
    ?show-arrow="${!!textureNodes.length}">
    <div slot="content">
      <font-awesome type="fas" name="image"></font-awesome>
      Textures
    </div>
    ${textureNodes}
  </tree-item>
</tree-item>
`;
  }

  updated() {
    const selected = this.shadowRoot.querySelector('tree-item[selected]');
    if (selected && selected.parentElement) {
      selected.parentElement.open = true;
    }
  }

  [$onTreeItemSelect](e) {
    e.stopPropagation();
    const treeItem = e.composedPath()[0];
    this.dispatchEvent(new CustomEvent('select-object', {
      detail: {
        uuid: treeItem.getAttribute('uuid'),
        type: treeItem.getAttribute('type-hint'),
      },
      bubbles: true,
      composed: true,
    }));
  }
}
