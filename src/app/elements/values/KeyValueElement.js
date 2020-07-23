import { LitElement, html } from '../../../../web_modules/lit-element.js'
import { getEntityName, cssStringToHexNumber, hexNumberToCSSString } from '../../utils.js';

const $onChange = Symbol('onChange');
const $onDependencyClick = Symbol('onDependencyClick');
const anchor = document.createElement('a');
let kvIterator = 0;

export default class KeyValueElement extends LitElement {
  static get properties() {
    return {
      uuid: { type: String, reflect: true },
      // @TODO probably should use less generic/collision-y
      // attribute names.
      keyName: { type: String, reflect: true, attribute: 'key-name'},
      value: { type: String, reflect: true },
      type: { type: String, reflect: true },
      enumType: { type: String, reflect: true, attribute: 'enum-type' },
      property: { type: String, reflect: true },
      readonly: { type: Boolean },
      // For number types only
      min: { type: Number, reflect: true },
      max: { type: Number, reflect: true },
      step: { type: Number, reflect: true },
      precision: { type: Number, reflect: true },
      // Optional data for data types (material, geometry)
      data: { type: Object },
    }
  }

  constructor() {
    super();
    // Currently no way to handle a true label/input match
    // across shadow boundaries? Can this be handled better?
    // https://github.com/whatwg/html/issues/3219
    this._id = `key-value-element-${kvIterator++}`;
    this.precision = 1;
    this.step = 1;
    this.min = -Infinity;
    this.max = Infinity;
  }

  onDataURLClick(e) {
    try {
      let stringified = JSON.stringify(this.value, null, 2);
      let blob = new Blob([stringified], { type: 'application/json' });
      let url = window.URL.createObjectURL(blob);
      anchor.setAttribute('href', url);
      anchor.setAttribute('target', '_window');
      anchor.click();
      // Clean it up immediately so we're not storing
      // large buffers for the lifetime of the tools
      window.URL.revokeObjectURL(url);
    } catch (e) {
    }
    e.preventDefault();
  }

  render() {

    let valueElement;

    if (this.value == null) {
      valueElement = html``;
    } else if (this.readonly) {
      valueElement = this.value;
    } else {
      switch (this.type) {
        case 'array':
          if (this.value) {
            valueElement = html`
            <a href="#" @click=${e => this.onDataURLClick(e)}>
              array
            </a>`;
          }
          else {
            valueElement = html`[]`;
          }
          break;
        case 'enum':
	  let enumType = this.enumType || this.property;
          valueElement = html`<enum-value .uuid="${this.uuid}" .type="${enumType}" .value="${this.value}"></enum-value>`;
          break;
        case 'vec2':
        case 'vec3':
        case 'vec4':
          const arity = this.type === 'vec2' ? 2 :
                        this.type === 'vec3' ? 3 : 4;
          valueElement = [...new Array(arity)].map((_, i) => html`<number-input
            .id="${i === 0 ? this._id : ''}"
            axis="${i === 0 ? 'x' : i === 1 ? 'y' : i === 2 ? 'z' : 'w'}"
            .value="${this.value[i]}"
            .min="${this.min}"
            .max="${this.max}"
            .step="${this.step}"
            .precision="${this.precision}"
            />`);
          break;
        case 'image':
        case 'texture':
        case 'material':
        case 'geometry':
          if (this.data) {
            const name = getEntityName(this.data);
            valueElement = html`<div class="badge" data-uuid="${this.value}" @click="${this[$onDependencyClick]}">${name}</div>`;
          } 
          break;
        case 'color':
          valueElement = html`<input id="${this._id}" type="color" .value="${hexNumberToCSSString(+this.value)}" />`;
          break;
        case 'boolean':
          valueElement = html`<input id="${this._id}" type="checkbox" .checked="${this.value}" />`;
          break;
        case 'number':
        case 'int':
        case 'angle':
          valueElement = html`<number-input
            .id="${this._id}"
            .value="${this.value}"
            .min="${this.min}"
            .max="${this.max}"
            .step="${this.step}"
            .precision="${this.precision}"
            />`;
          break;
        case 'string':
          valueElement = this.value;
          break;
        default:
          valueElement = this.value;
      }
    }

    return html`
<style>
  /**
   * Current CSS API:
   *
   * --key-value-height: auto; // Yes can be styled by parent, but this ensures
   *                           // that all views use the same height
   * --key-value-divider-position: 30%;
   * --key-value-padding-left: 10px;
   */

  :host {
    height: var(--key-value-height, auto);
    width: 100%;
    display: flex;
    align-items: center;
  }

  label {
    flex: 0 0 var(--key-value-divider-position, 30%);
  }
  #value {
    flex: 1;
  }

  label, #value {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-left: var(--key-value-padding-left, 10px);
  }

  #value 
  #value[type="vec4"] number-input {
    width: 25%;
  }
  #value[type="vec3"] number-input {
    width: 33%;
  }
  #value[type="vec2"] number-input {
    width: 50%;
  }
  .badge {
    background-color: var(--tab-selected-bg-color);
    padding: 1px 5px;
  }

</style>
<label title="${this.keyName}" for="${this._id}">${this.keyName}</label>
<div name="${this.keyName}" @change="${this[$onChange]}" id="value" type="${this.type}">
  ${valueElement}
</div>
`;
  }

  [$onDependencyClick](e) {
    const target = e.composedPath()[0];
    const uuid = target.getAttribute('data-uuid');
    if (uuid !== null) {
      this.dispatchEvent(new CustomEvent('command', { detail: {
        type: 'select-entity',
        uuid,
      },
        bubbles: true,
        composed: true,
      }));
    }
  }

  [$onChange](e) {

    const target = e.composedPath()[0];

    let value = null;
    let dataType = null;
    let property = this.property;
    switch (this.type) {
      case 'color':
        value = target.value ? cssStringToHexNumber(target.value) : 0;
        dataType = 'color';
        break;
      case 'boolean':
        value = !!target.checked;
        dataType = 'boolean';
        break;
      case 'number':
      case 'radians':
        dataType = 'number';
        value = target.value;
        break;
      case 'enum':
        dataType = 'number';
        value = e.detail.value;
        break;
      case 'vec2':
      case 'vec3':
      case 'vec4':
        dataType = this.type;
        value = e.detail.value;
        // Add 'x', 'y', 'z', 'w' to the property name
        property = `${this.property}.${target.getAttribute('axis')}`;
        break;
      default:
        value = target.value;
    }

    if (value !== null) {
      this.dispatchEvent(new CustomEvent('command', { detail: {
        type: 'update-property',
        uuid: this.uuid,
        property,
        dataType,
        value,
      },
        bubbles: true,
        composed: true,
      }));
    }
  }
}
