import { LitElement, html } from '../../../../web_modules/lit-element.js'
import { cssStringToHexNumber, hexNumberToCSSString } from '../../utils.js';

const $onChange = Symbol('onChange');

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
      property: { type: String, reflect: true },
    }
  }

  constructor() {
    super();
    // Currently no way to handle a true label/input match
    // across shadow boundaries? Can this be handled better?
    // https://github.com/whatwg/html/issues/3219
    this._id = `key-value-element-${kvIterator++}`;
  }

  render() {

    let valueElement;

    switch (this.type) {
      case 'enum':
        valueElement = html`<enum-value .uuid="${this.uuid}" .property="${this.property}" .value="${this.value}"></enum-value>`;
        break;
      case 'vec3':
        valueElement = this.value;
        break;
      case 'material':
        valueElement = html`<material-value .uuid="${this.value}"></material-value>`;
        break;
      case 'color':
        valueElement = html`<input type="color" .value=${hexNumberToCSSString(+this.value)}/>`;
        break;
      case 'boolean':
        valueElement = html`<input type="checkbox" .checked="${this.value}" />`;
        console.log('setting boolean', this.uuid, this.property, this.value, valueElement);
        break;
      case 'number':
        valueElement = html`<input type="type" value="${this.value}" />`;
        break;
      case 'string':
        valueElement = this.value;
        break;
      default:
        valueElement = this.value;
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

</style>
<label for="${this._id}">${this.keyName}</label>
<div @change="${this[$onChange]}" id="value">${valueElement}</div>
`;
  }

  [$onChange](e) {

    const target = e.composedPath()[0];

    let value = null;
    let dataType = null;
    if (e.detail && e.detail.value) {
      console.log('not yet implemented');
    } else if (target.tagName === 'INPUT') {
      switch (target.getAttribute('type')) {
        case 'color':
          value = target.value ? cssStringToHexNumber(target.valuel) : 0; break;
          dataType = 'color';
        case 'checkbox':
          value = !!target.checked; break;
          dataType = 'boolean';
        case 'number':
          dataType = 'number';
        default:
          value = target.value;
      }
    } else if (target.tagName === 'SELECT') {
      const selected = [...target.querySelector('option')].filter(o => o.selected);
      if (selected) {
        dataType = 'number'; // Is <select> only for enums?
        value = selected.value;
      }
    }

    if (value !== null) {
      this.dispatchEvent(new CustomEvent('command', { detail: {
        type: 'update-property',

        uuid: this.uuid,
        property: this.property,
        dataType,
        value,
      },
        bubbles: true,
        composed: true,
      }));
    }
  }
}
