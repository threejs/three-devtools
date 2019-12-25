import { LitElement, html } from '../../../web_modules/lit-element.js'
import { getEntityName } from '../utils.js';

const $onContentUpdate = Symbol('onContentUpdate');
const $onTreeItemSelect = Symbol('onTreeItemSelect');
const filters = {
  geometry: {
    title: 'Geometry',
    resources: 'geometries',
  },
  material: {
    title: 'Material',
    resources: 'materials',
  },	
  texture: {
    title: 'Texture',
    resources: 'textures',
  }
};

export default class ResourcesViewElement extends LitElement {
  static get properties() {
    return {
      filter: { type: String, reflect: true },
      selected: { type: String, reflect: true },
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
    // If the observed object has been updated in
    // storage, force a rerender
    this.requestUpdate();
  }

  render() {
    const filter = filters[this.filter];
    if (!filter) {
      return html`<div>no filter</div>`;
    }

    const resources = this.app.content.getEntitiesOfType(filter.resources);
    if (!resources || !this.uuid) {
      return html`<div>no resources</div>`;
    }


    let nodes = resources.map((obj, i) => {
      let selected = obj.uuid && this.selected && this.selected === obj.uuid;
      let unique = obj.uuid || `${this.filter}-${i}`;
      let name = getEntityName(obj);
      return html`
      <tree-item
        unique="${unique}"
        ?selected="${selected}"
        depth="0"
      >
      <div slot="content">${name}</div>
      </tree-item>
      `;
    });

    const title = filter.title;
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

  [$onTreeItemSelect](e) {
    e.stopPropagation();
    const treeItem = e.composedPath()[0];
    const uuid = treeItem.getAttribute('unique');
    this.dispatchEvent(new CustomEvent('select-entity', {
      detail: {
        uuid,
      },
      bubbles: true,
      composed: true,
    }));
  }
}
