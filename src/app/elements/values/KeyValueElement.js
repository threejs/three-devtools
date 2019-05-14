import { LitElement, html } from '../../../../web_modules/lit-element.js'
import { hexNumberToCSSString } from '../../utils.js';

const $onChange = Symbol('onChange');

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

  render() {

    let valueElement;

    switch (this.type) {
      case 'enum':
        valueElement = html`<enum-value uuid="${this.uuid}" property="${this.property}" value="${this.value}" type="${this.property}"></enum-value>`;
        break;
      case 'vec3':
        valueElement = this.value;
        break;
      case 'material':
        valueElement = html`<material-value uuid=${this.value}></material-value>`;
        break;
      case 'color':
        valueElement = html`<input type="color" value=${hexNumberToCSSString(this.value)}/>`;
        break;
      case 'boolean':
        valueElement = html`<input type="checkbox" ?checked=${this.value} />`;
        break;
      case 'number':
        valueElement = html`<input type="type" value=${this.value} />`;
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

  #key {
    flex: 0 0 var(--key-value-divider-position, 30%);
  }
  #value {
    flex: 1;
  }

  #key, #value {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-left: var(--key-value-padding-left, 10px);
  }

</style>
<div id="key">${this.keyName}</div>
<div @change="${this[$onChange]}" id="value">${valueElement}</div>
`;
  }

  [$onChange](e) {

    const target = e.composedPath()[0];

    let value = null;
    if (e.detail && e.detail.value) {
      console.log('not yet implemented');
    } else if (target.tagName === 'INPUT') {
      switch (target.getAttribute('type')) {
        case 'checkbox':
          value = !!target.checked; break;
        default:
          value = target.value;
      }
    } else if (target.tagName === 'SELECT') {
      const selected = [...target.querySelector('option')].filter(o => o.selected);
      if (selected) {
        value = selected.value;
      }
    }

    if (value !== null) {
      this.dispatchEvent(new CustomEvent('command', { detail: {
        type: 'update-property',

        uuid: this.uuid,
        property: this.property,
        value,
      },
        bubbles: true,
        composed: true,
      }));
    }
  }
}
