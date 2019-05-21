import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';
import { objectTypeToCategory } from '../utils.js';

const $onSelectScene = Symbol('onSelectScene');
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

  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tree-item-select', this[$onTreeItemSelect]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('tree-item-select', this[$onTreeItemSelect]);
  }

  render() {
    const scene = this.getEntity();

    if (!scene) {
      return html`<div>no scene registered</div>`;
    }

    const createNode = (obj, depth=0) => {
      const children = obj.children ? obj.children.map(uuid => this.app.content.get(uuid)) : [];
      const category = objectTypeToCategory(obj.type);
      const fa = category === 'light' ? { type: 'fas', name: 'lightbulb' } :
                 category === 'mesh' ?  { type: 'fas', name: 'dice-d6' } :
                 category === 'helper' ?  { type: 'fas', name: 'hands-helping' } :
                 category === 'line' ?  { type: 'fas', name: 'grip-lines-vertical' } :
                 category === 'group' ?  { type: 'fas', name: 'archive' } :
                 category === 'bone' ?  { type: 'fas', name: 'bone' } : {};

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
</style>
<title-bar title="Scene"></title-bar>
${createNode(scene)}
`;
  }

  [$onTreeItemSelect](e) {
    e.stopPropagation();
    const treeItem = e.composedPath()[0];
    this.dispatchEvent(new CustomEvent('select-object', {
      detail: {
        uuid: treeItem.getAttribute('uuid'),
        type: 'object',
      },
      bubbles: true,
      composed: true,
    }));
  }
}
