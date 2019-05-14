import { LitElement, html } from '../../../../web_modules/lit-element.js'
import { ConstantTypes } from '../../constants.js';
import * as constants from '../../../../web_modules/three/src/constants.js';

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
      const value = constants[c];
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

/*
 * Styling taken from css/inspectorCommon.css from chrome devtools
 */
select {
    /* Form elements do not automatically inherit font style from ancestors. */
    font-family: inherit;
    font-size: inherit;
}

.chrome-select {
    -webkit-appearance: none;
    -webkit-user-select: none;
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 2px;
    color: #333;
    font: inherit;
    margin: 0;
    outline: none;
    padding-right: 20px;
    padding-left: 6px;
    background-image: -webkit-image-set(url('assets/chromeSelect.png') 1x, url('assets/chromeSelect_2x.png') 2x);
    background-color: hsl(0, 0%, 98%);
    background-position: right center;
    background-repeat: no-repeat;
    min-height: 24px;
    min-width: 80px;
    background-size: 15px;
}

.chrome-select:enabled:active,
.chrome-select:enabled:focus,
.chrome-select:enabled:hover {
    background-color: hsl(0, 0%, 96%);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.chrome-select:enabled:active {
    background-color: #f2f2f2;
}

.chrome-select:enabled:focus {
    border-color: transparent;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(66, 133, 244, 0.4);
}

.chrome-select:disabled {
    opacity: 0.38;
}

.chrome-select optgroup,
.chrome-select option {
    background-color: #EEEEEE;
    color: #222;
}
</style>
<select class="chrome-select" @input="${this[$onInput]}">${options}</select>
`;
  }

  [$onInput](e) {
    const selected = [...e.target.querySelectorAll('option')].filter(o => o.selected)[0];
    const value = +selected.value;

    if (value !== null) {
      this.dispatchEvent(new CustomEvent('command', { detail: {
        type: 'update-property',

        uuid: this.uuid,
        property: this.type,
        dataType: 'number',
        value,
      },
        bubbles: true,
        composed: true,
      }));
    }
  }
}
