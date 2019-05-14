import { LitElement, html } from '../../../../web_modules/lit-element.js'
import * as constants from '../../../../web_modules/three/src/constants.js';

const $onInput = Symbol('onInput');

const ConstantTypes = {
  drawMode: [
    'TrianglesDrawMode',
    'TriangleStripDrawMode',
    'TriangleFanDrawMode'
  ],
};

export default class EnumValueElement extends LitElement {
  static get properties() {
    return {
      uuid: { type: String, reflect: true },
      property: { type: String, reflect: true },
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

    const options = ConstantTypes[this.type].map(c => {
      const value = constants[c];
      if (typeof value !== 'number') {
        throw new Error(`invalid constant value for ${c}`);
      }
      return html`<option value="${value}">${c}</option>`;
    });

    return html`
<style>
  :host {
    display: flex;
  }
</style>
<select @input="${this[$onInput]}">${options}</select>
`;
  }

  [$onInput](e) {
    const selected = [...e.target.querySelectorAll('option')].filter(o => o.selected)[0];
    const value = +selected.value;

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
