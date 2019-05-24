import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';
import { objectTypeToCategory } from '../utils.js';
import ChromeSelectStyle from './shared-styles/chrome-select.js';

const $onSceneSelect = Symbol('onSceneSelect');
const $onContentUpdate = Symbol('onContentUpdate');
const $onTreeItemSelect = Symbol('onTreeItemSelect');

export default class SceneViewElement extends BaseElement {
  static get typeHint() { return 'scene'; }

  static get properties() {
    return {
      selected: { type: String, reflect: true },
      ...BaseElement.properties,
    }
  }

  constructor() {
    super();
    this[$onTreeItemSelect] = this[$onTreeItemSelect].bind(this);
    this[$onContentUpdate] = this[$onContentUpdate].bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tree-item-select', this[$onTreeItemSelect]);
    // This is redundant as this is a BaseElement, so it's already listening
    // to this, specifically the selected scene.
    // @TODO need to rethink this, possibly something like Redux's selectors
    // to handle this.
    this.app.content.addEventListener('update', this[$onContentUpdate]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('tree-item-select', this[$onTreeItemSelect]);
    this.app.content.removeEventListener('update', this[$onContentUpdate]);
  }

  render() {
    const scene = this.getEntity();
    const resources = this.app.content.getAllResources();
    const scenes = resources ? resources.scene : [];
    console.log(resources, scenes);

    if (!scene) {
      return html`<div>no scene registered</div>`;
    }

    const createNode = (obj, depth=0) => {
      const children = obj.children ? obj.children.map(uuid => this.app.content.get(uuid)) : [];

      return html`
      <tree-item
        tabindex="${depth === 0 ? 0 : ''}"
        ?root="${depth === 0}"
        ?selected="${obj.uuid && this.selected && this.selected === obj.uuid}"
        ?open="${obj.type === 'Scene'}"
        ?show-arrow="${children.length > 0}"
        depth="${depth}"
        uuid="${obj.uuid}"
        >
        <div slot="content">${obj.name || obj.type}</div>
        ${children.map(c => createNode(c, depth + 1))}
      </tree-item>
    `;
    }

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

  ${ChromeSelectStyle}
</style>
<title-bar title="Scene">
  <select @change="${this[$onSceneSelect]}" class="chrome-select">
    ${scenes.map(scene => html`<option value="${scene.uuid}">${scene.uuid}</option>`)}
  </select>
</title-bar>
${createNode(scene)}
`;
  }
 
  [$onSceneSelect](e) {
    console.log("SCENE SELECT", e, e.target, e.target.value)
    this.dispatchEvent(new CustomEvent('select-scene', {
      detail: {
        uuid: e.target.value,
      },
      bubbles: true,
      composed: true,
    }));
  }

  [$onContentUpdate](e) {
    if (e.detail.typeHint === 'scene') {
      // Maybe the selector should be pulled into its own component,
      // this is a bit messy.
      this.requestUpdate();
    }
  }

  [$onTreeItemSelect](e) {
    e.stopPropagation();
    const treeItem = e.composedPath()[0];
    this.dispatchEvent(new CustomEvent('select-entity', {
      detail: {
        uuid: treeItem.getAttribute('uuid'),
        type: 'object',
      },
      bubbles: true,
      composed: true,
    }));
  }
}
