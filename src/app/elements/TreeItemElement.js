import { LitElement, html } from '../../../web_modules/lit-element.js'

const $onVisibilityToggle = Symbol('onVisibilityToggle');

export default class TreeItemElement extends LitElement {
  static get properties() {
    return {
      open: {type: Boolean, reflect: true},
      // @TODO can `show-arrow` be baked in by checking if there
      // are children?
      showArrow: {type: Boolean, reflect: true, attribute: 'show-arrow'},
    }
  }

  constructor() {
    super();
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
  }

  render() {
    return html`
<style>
  :host {
    height: 20px;
    width: 100%;
    display: block;
  }

  .arrow {
    display: inline-block;
    width: 20px;
    height: 20px;
    background-color: transparent;
    border: 0;
    position: relative;
    pointer-events: none;
  }

  .arrow::after {
    content: '>';
    font-size: 120%;
    display: none;
    position: absolute;
    left: 0;
    top: 0;
  }
  :host([show-arrow]) .arrow::after {
    display: block;
    pointer-events: auto;
  }
  :host([open]) .arrow::after {
    transform: rotate(90deg);
  }

  slot[name=content] {
    display: inline-block;
  }

  #children {
    display: none;
  }

  :host([open]) #children {
    display: block;
  }
</style>
<button class="arrow" @click="${this[$onVisibilityToggle]}"></button>
<slot name="content"></slot>
<slot id="children"></slot>
`;
  }

  [$onVisibilityToggle](e) {
    console.log('stopping propagation');
    e.stopPropagation();
    this.open = !this.open;
  }
}
