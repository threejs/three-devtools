import { LitElement, html } from '../../../web_modules/lit-element.js'

const $onVisibilityToggle = Symbol('onVisibilityToggle');
const $onClick = Symbol('onClick');

export default class AccordionViewElement extends LitElement {
  static get properties() {
    return {
      open: {type: Boolean, reflect: true},
    }
  }

  render() {
    return html`
<style>
  :host {
    width: 100%;
    display: block;
    cursor: pointer;
  }
  .row {
    display: flex;
    height: 20px;
    width: 100%;
    align-items: center;
    padding-left: 10px;
  }

  .arrow {
    flex: 0 1 24px;
    background-color: transparent;
    border: 0;
    padding: 0;
    position: relative;
    pointer-events: none;
  }

  .arrow::after {
    content: '▸';
    font-size: 14px;
    color: #999;
    display: none;
    pointer-events: auto;
  }

  .arrow::after {
    display: block;
  }
  :host([open]) .arrow::after {
    transform: rotate(90deg);
  }

  slot[name=content] {
    flex: 1;
  }

  #children {
    display: none;
  }

  :host([open]) #children {
    display: block;
  }
</style>
  <div class="row"
    @click="${this[$onClick]}">
    <button class="arrow" @click="${this[$onVisibilityToggle]}"></button>
    <slot name="content"></slot>
  </div>
  <slot id="children"></slot>
</div>
`;
  }

  [$onVisibilityToggle](e) {
    e.stopPropagation();
    this.open = !this.open;
  }

  [$onClick](e) {
    e.stopPropagation();
    this.open = !this.open;
  }
}
