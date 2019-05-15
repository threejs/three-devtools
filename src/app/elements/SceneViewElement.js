import { html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';
import { objectTypeToCategory } from '../utils.js';

const $onSelectScene = Symbol('onSelectScene');
const $onClick = Symbol('onClick');

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
    this[$onClick] = this[$onClick].bind(this);

  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this[$onClick]);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('click', this[$onClick]);
  }

  render() {
    const scene = this.getEntity();

    if (!scene) {
      return html`<div>no scene registered</div>`;
    }

    const createNode = (obj, depth=0) => {
      const category = objectTypeToCategory(obj.type);
      const fa = category === 'light' ? { type: 'fas', name: 'lightbulb' } :
                 category === 'mesh' ?  { type: 'fas', name: 'dice-d6' } :
                 category === 'helper' ?  { type: 'fas', name: 'hands-helping' } :
                 category === 'bone' ?  { type: 'fas', name: 'bone' } : {};

      return html`
      <tree-item
        ?selected="${obj.uuid && this.selected && this.selected === obj.uuid}"
        ?open="${obj.type === 'Scene'}"
        ?show-arrow="${obj.children ? obj.children.length > 0 : false}"
        depth="${depth++}"
        uuid="${obj.uuid}"
        >
        <div slot="content"><font-awesome type="${fa.type}" name="${fa.name}"></font-awesome>${obj.name || obj.type}</div>
        ${obj.children ? obj.children.map(c => createNode(c, depth)) : null}
      </tree-item>
    `;
    }

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }

  :host > tree-item {
    height: auto;
    max-height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
  }

  font-awesome {
    color: #5a5a5a;
    padding-right: 5px;
  }
  [selected] font-awesome {
    color: var(--tree-item-selected-color);
  }
</style>
<title-bar title="Scene"></title-bar>
${createNode(scene)}
`;
  }

  [$onClick](e) {
    for (let target of e.composedPath()) {
      if (!target.hasAttribute) {
        // Shadow roots don't have attributes
        continue;
      }
      if (target.hasAttribute('uuid')) {
        const uuid = target.getAttribute('uuid');
        this.dispatchEvent(new CustomEvent('select-object', { detail: {
          uuid,
          type: 'object',
        },
          bubbles: true,
          composed: true,
        }));
        return;
      }
    }
    console.warn('no node with uuid found?');
  }
}
