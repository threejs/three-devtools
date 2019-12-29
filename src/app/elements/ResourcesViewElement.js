import { LitElement, html } from '../../../web_modules/lit-element.js'
import { getEntityName } from '../utils.js';

const $onTreeItemSelect = Symbol('onTreeItemSelect');
const $onRefreshClick = Symbol('onRefreshClick');

export default class ResourcesViewElement extends LitElement {
  static get properties() {
    return {
      title: { type: String, reflect: true },
      selected: { type: String, reflect: true },
      resources: { type: Array },
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('tree-item-select', this[$onTreeItemSelect]);
  }

  disconnectedCallback() {
    this.removeEventListener('tree-item-select', this[$onTreeItemSelect]);
    super.disconnectedCallback();
  }

  render() {
    const title = this.title;
    const resources = this.resources || [];

    let nodes = resources.map((obj, i) => {
      let selected = obj.uuid && this.selected && this.selected === obj.uuid;
      let name = getEntityName(obj);
      return html`
      <tree-item
        unique="${obj.uuid}"
        ?selected="${selected}"
        depth="0"
      >
      <div slot="content">${name}</div>
      </tree-item>
      `;
    });

    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  :host > tree-item {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  #tree-root {
    --tree-item-arrow-width: 0.8em;
  }
  #tree-root:focus {
    /* TODO how can focus be shown in the tree view? */
    outline: none;
  }
</style>
<title-bar title="${title}">
  <devtools-icon-button icon="refresh" @click="${this[$onRefreshClick]}">
</title-bar>
<tree-item
  id="tree-root"
  tabindex="0"
  root
  open
  depth="-1">
  ${nodes}

  <!--
  <tree-item depth="0"
    ?show-arrow="true"
    <div slot="content">
      Geometry (1)
    </div>
    (nodes)
  </tree-item>
  -->
</tree-item>
`;
  }

  updated() {
    const selected = this.shadowRoot.querySelector('tree-item[selected]');
    if (selected && selected.parentElement) {
      selected.parentElement.open = true;
    }
  }

  [$onRefreshClick](e) {
    this.dispatchEvent(new CustomEvent('command', {
      detail: {
        type: 'refresh',
      },
      bubbles: true,
      composed: true,
    }));
  }

  [$onTreeItemSelect](e) {
    e.stopPropagation();
    const treeItem = e.composedPath()[0];
    const uuid = treeItem.getAttribute('unique');
    this.dispatchEvent(new CustomEvent('command', {
      detail: {
        type: 'select-entity',
        uuid,
      },
      bubbles: true,
      composed: true,
    }));
  }
}
