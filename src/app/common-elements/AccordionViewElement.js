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
  /**
   * Current CSS API:
   * var(--title-color)
   * var(--title-background-color)
   * var(--title-border-color)
   */

  :host {
    width: 100%;
    cursor: pointer;
    display: flex; 
    flex-direction: column;
    line-height: 15px;
    white-space: nowrap;
    align-items: center;
    overflow: hidden;
  }

  .row {
    display: flex;
    flex: 1;
    width: 100%;
    align-items: center;
    padding-left: 4px;
    color: var(--title-color);
    background-color: var(--title-background-color);
    border-bottom: 1px solid var(--title-border-color);
  }

  .arrow {
    height: 14px;
    width: 14px;
    flex: 0 1 14px;
    background-color: transparent;
    border: 0;
    padding: 0;
    position: relative;
    pointer-events: none;
  }
  .arrow:focus {
    outline: none;
  }

  .arrow::after {
    content: '▸';
    font-size: 14px;
    color: rgb(110, 110, 110);
    display: none;
    pointer-events: auto;
    transform: translateY(-2px);
  }

  .arrow::after {
    display: block;
  }
  :host([open]) .arrow::after {
    transform: rotate(90deg);
  }

  slot[name=content] {
    text-overflow: ellipsis;
    padding: 2px 0.8em;
    flex: 1;
  }

  #children {
    display: none;
    width: 100%;
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
