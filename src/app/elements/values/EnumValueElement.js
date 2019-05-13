import { LitElement, html } from '../../../../web_modules/lit-element.js'
import * as constants from '../../../../web_modules/three/src/constants.js';

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
      // Type of enum, e.g. "drawMode", "side", "blendMode"
      type: { type: String, reflect: true },
      // Numerical value of enum.
      value: { type: String, reflect: true },
    }
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
<select>${options}</select>
`;
  }
}
