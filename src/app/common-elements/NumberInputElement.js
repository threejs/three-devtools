import { LitElement, html } from '../../../web_modules/lit-element.js';
//import { LitElement, html } from '../examples/web_modules/lit-element.js'

const $onActivate = Symbol('onActivate');

/**
 * A LitElement form of A-Frame Inspector's number widget
 * https://github.com/aframevr/aframe-inspector/blob/master/src/components/widgets/NumberWidget.js
 */
class NumberInputElement extends LitElement {
  static get properties() {
    return {
      min: { type: Number },
      max: { type: Number },
      step: { type: Number },
      value: { type: Number },
      precision: { type: Number },
    }
  }

  constructor() {
    super();
    this.min = -Infinity;
    this.max = Infinity;
    this.value = 0;
    this.precision = 3;
    this.step = 1;

    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
  };

  firstUpdated() {
    this.distance = 0;
    this.onMouseDownValue = 0;
    this.prevPointer = [0, 0];
    this.$input = this.shadowRoot.querySelector('input');
    this.setValue(this.value);
    this.onBlur();
  }

  onMouseMove(event) {
    const currentValue = parseFloat(this.value);
    const pointer = [event.clientX, event.clientY];
    const delta =
      pointer[0] - this.prevPointer[0] - (pointer[1] - this.prevPointer[1]);
    this.distance += delta;

    // Add minimum tolerance to reduce unintentional drags when clicking on input.
    if (Math.abs(delta) <= 2) {
      return;
    }

    let value = this.onMouseDownValue;
    const accel = event.shiftKey ? 10 : 1;
    value = parseInt(this.distance / 2) * accel * this.step;
    value += currentValue;
    value = Math.min(this.max, Math.max(this.min, value));
    if (currentValue !== value) {
      this.setValue(value);
    }
    this.prevPointer = [event.clientX, event.clientY];
  }

  onMouseDown(event) {
    event.preventDefault();
    this.distance = 0;
    this.onMouseDownValue = this.value;
    this.prevPointer = [event.clientX, event.clientY];
    document.addEventListener('mousemove', this.onMouseMove, false);
    document.addEventListener('mouseup', this.onMouseUp, false);
  };

  onMouseUp(event) {
    document.removeEventListener('mousemove', this.onMouseMove, false);
    document.removeEventListener('mouseup', this.onMouseUp, false);

    if (Math.abs(this.distance) < 2) {
      this.$input.focus();
      this.$input.select();
    }
  };

  setValue(value) {
    if (value === this.value) return;

    if (value !== undefined) {
      if (this.precision === 0) {
        value = parseInt(value);
      } else {
        value = parseFloat(value);
      }

      if (value < this.min) {
        value = this.min;
      }
      if (value > this.max) {
        value = this.max;
      }

      this.value = value;
      this.dispatchEvent(new CustomEvent('change', {
        detail: {
          value: parseFloat(value.toFixed(5)),
        },
        bubbles: true,
        composed: true,
      }));
    }
  }

  shouldUpdate(changed) {
    // This will be triggered typically when the element is changed directly with
    // element.setAttribute.
    if (changed.has('value') && changed.get('value') !== this.value) {
      return true;
    }
    return true;
  }

  onBlur() {
    this.setValue(parseFloat(this.$input.value));
  }

  onChange(e) {
    this.setValue(e.target.value);
  };

  onKeyDown(event) {
    event.stopPropagation();

    // enter.
    if (event.keyCode === 13) {
      this.setValue(parseFloat(this.$input.value));
      this.$input.blur();
      return;
    }

    // up.
    if (event.keyCode === 38) {
      this.setValue(parseFloat(this.value) + this.step);
      return;
    }

    // down.
    if (event.keyCode === 40) {
      this.setValue(parseFloat(this.value) - this.step);
      return;
    }
  };

  render() {
    const displayValue = this.value.toFixed(this.precision);
    return html`
<style>
:host {
  display: inline-block;
}
input {
  width: 100%;
}
</style>
<input
  type="text"
  .value=${displayValue}
  @keydown=${this.onKeyDown}
  @change=${this.onChange}
  @mousedown=${this.onMouseDown}
  @focus=${this.onFocus}
  @blur=${this.onBlur}
/>
    `;
  }
}
export default NumberInputElement;
