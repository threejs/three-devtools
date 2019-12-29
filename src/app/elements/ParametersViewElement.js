import { LitElement, html } from '../../../web_modules/lit-element.js'
import ObjectTypes from '../data/objects.js';
import MaterialTypes from '../data/materials.js';
import GeometryTypes from '../data/geometry.js';
import TextureTypes from '../data/textures.js';
import { getEntityName } from '../utils.js';

const $onRefresh = Symbol('onRefresh');
const commonProps = [{
  name: 'Type',
  type: 'string',
  prop: 'baseType',
}, {
  name: 'UUID',
  type: 'string',
  prop: 'uuid',
}, {
  name: 'Name',
  type: 'string',
  prop: 'name',
}];

function propsToElements(entity, elements, props) {
  for (let prop of props) {
    if (typeof prop === 'function') {
      const result = prop(entity);
      if (result) {
        prop = result;
      } else {
        continue;
      }
    }
    
    if (prop.type === 'group') {
      const subProps = [];
      propsToElements(entity, subProps, [...prop.props]);
      elements.push(html`<accordion-view>
        <div class="accordion-title" slot="content">${prop.name}</div>
        ${subProps}
      </accordion-view>`);
      continue;
    } else {
      const { name, type, prop: propName, default: def } = prop;
      let path = propName.split('.');
      let target = entity;
      let key = path.shift();
      // Support nested properties, like 'data.attributes'
      while (path.length) {
        if (!(key in target)) {
          break;
        }
        target = target[key];
        key = path.shift();
      }

      const value = (key in target ) ? target[key] : def;
      elements.push(html`
        <key-value uuid=${entity.uuid}
          key-name="${name}"
          .value="${value}"
          type="${type}"
          property="${propName}">
        </key-value>`);
    }
  }
}

export default class ParametersViewElement extends LitElement {
  static get properties() {
    return {
      entity: { type: Object },
    }
  }

  [$onRefresh](e) {
    this.dispatchEvent(new CustomEvent('command', {
      detail: {
        type: 'refresh',
      },
      bubbles: true,
      composed: true,
    }));
  }

  render() {
    const entityTitle = this.entity ? getEntityName(this.entity) : '';
    const elements = [];

    if (this.entity) {
      const entity = this.entity;
      let definition = ObjectTypes[entity.baseType] ||
                        MaterialTypes[entity.baseType] ||
                        GeometryTypes[entity.baseType];
                        TextureTypes[entity.baseType];
      if (!definition) {
        definition = ObjectTypes.Object3D;
      }

      propsToElements(entity, elements, [...commonProps, ...definition.props]);
    }

    return html`
<style>
  :host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
  }

  .properties {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .hide {
    display: none;
  }

  accordion-view {
    border-top: 1px solid var(--title-border-color);
  }

  accordion-view ~ accordion-view {
    border-top: 0px;
  }

  accordion-view[open] {
    border-bottom: 1px solid var(--title-border-color);
  }

  .accordion-title {
    line-height: 15px;
    white-space: nowrap;
    align-items: center;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 2px 0.2em;
  }

</style>
<title-bar title="${entityTitle}">
  <devtools-icon-button icon="refresh" class="${!this.entity ? 'hide' : ''}" @click="${this[$onRefresh]}">
</title-bar>
<div class="properties">
  ${elements} 
</div>
`;
  }
}
