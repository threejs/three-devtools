import { LitElement, html } from '../../../../web_modules/lit-element.js'
import { ConstantTypes } from '../../constants.js';
import * as constants from '../../../../web_modules/three/src/constants.js';
import ChromeSelectStyle from '../shared-styles/chrome-select.js';

const $onInput = Symbol('onInput');

export default class EnumValueElement extends LitElement {
  static get properties() {
    return {
      uuid: { type: String, reflect: true },
      // Type of enum, e.g. "drawMode", "side", "blendMode"
      type: { type: String, reflect: true },
      // Numerical value of enum.
      value: { type: String, reflect: true },
    }
  }

  constructor() {
    super();
    this[$onInput] = this[$onInput].bind(this);
  }

  render() {

    if (!ConstantTypes[this.type]) {
      return html`<input type="number" value="${this.value}" />`;
    }

    const options = ConstantTypes[this.type].map((c,i) => {
      let value = constants[c];

      // Let 'null' be a special enum that is -1
      if (c === 'null') {
        value = -1;
      }

      if (typeof value !== 'number') {
        throw new Error(`invalid constant value for ${c}`);
      }
      const selected = this.value === undefined ? i === 0 : this.value === value;
      return html`<option value="${value}" .selected="${selected}">${c}</option>`;
    });

    return html`
<style>
  :host {
    display: flex;
  }

${ChromeSelectStyle}
</style>
<select class="chrome-select" @input="${this[$onInput]}">${options}</select>
`;
  }

  [$onInput](e) {
    const selected = [...e.target.querySelectorAll('option')].filter(o => o.selected)[0];
    const value = +selected.value;

    if (value !== null) {
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value,
        },
        bubbles: true,
        composed: true,
      }));
    }
  }
}
