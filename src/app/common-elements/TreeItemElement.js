import { LitElement, html } from '../../../web_modules/lit-element.js'

const $onVisibilityToggle = Symbol('onVisibilityToggle');
const $onDoubleClick = Symbol('onDoubleClick');

export default class TreeItemElement extends LitElement {
  static get properties() {
    return {
      open: {type: Boolean, reflect: true},
      // @TODO can `show-arrow` be baked in by checking if there
      // are children?
      showArrow: {type: Boolean, reflect: true, attribute: 'show-arrow'},
      depth: {type: Number, reflect: true},
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
  /**
   * Current CSS API:
   *
   * --tree-item-indent-per-level: 10px
   * --tree-item-row-height: 20px
   * --tree-item-border-color
   * --tree-item-hover-color
   * --tree-item-hover-background-color
   * --tree-item-selected-color
   * --tree-item-selected-background-color
   */

  :host {
    height: 20px;
    width: 100%;
    display: block;
    cursor: pointer;
  }
  :host([depth]) {
    border-top: 1px solid var(--tree-item-border-color);
  }
  :host([depth="0"]) {
    border: 0;
  }
  :host([depth="0"]) #children {
    border-bottom: 1px solid var(--tree-item-border-color);
  }

  .row {
    display: flex;
    height: var(--tree-item-row-height, 20px);
    width: 100%;
    align-items: center;
    padding-left: calc(var(--depth, 0) * var(--tree-item-indent-per-level, 10px));
  }

  .row:hover {
    color: var(--tree-item-hover-color);
    background-color: var(--tree-item-hover-background-color);
  }

  :host([selected]) .row {
    color: var(--tree-item-selected-color);
    background-color: var(--tree-item-selected-background-color);
  }

  :host([selected]) .row:hover {
    color: var(--tree-item-hover-selected-color);
    background-color: var(--tree-item-hover-selected-background-color);
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

  :host([show-arrow]) .arrow::after {
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
    style="--depth:${this.depth || 0}"
    @dblclick="${this[$onDoubleClick]}">
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

  [$onDoubleClick](e) {
    e.stopPropagation();
    this.open = !this.open;
  }
}
