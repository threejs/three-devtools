import { LitElement, html } from '../../../web_modules/lit-element.js'

const $onVisibilityToggle = Symbol('onVisibilityToggle');
const $onClick = Symbol('onClick');
const $onDoubleClick = Symbol('onDoubleClick');
const $onKeyUp = Symbol('onKeyUp');
const $onTreeItemSelect = Symbol('onTreeItemSelect');
const $addListeners = Symbol('addListeners');
const $removeListeners = Symbol('removeListeners');
const $connected = Symbol('connected');
const $listening = Symbol('listening');

/**
 * TODO leverage ideas from wai-aria practices treeitem demo:
 * https://www.w3.org/TR/wai-aria-practices/examples/treeview/treeview-2/treeview-2a.html
 */
export default class TreeItemElement extends LitElement {
  static get properties() {
    return {
      open: {type: Boolean, reflect: true},
      // @TODO can `show-arrow` be baked in by checking if there
      // are children?
      showArrow: {type: Boolean, reflect: true, attribute: 'show-arrow'},
      depth: {type: Number, reflect: true},
      root: {type: Boolean, reflect: true},
      selected: {type: Boolean, reflect: true},
    }
  }

  constructor() {
    super();
    this[$onKeyUp] = this[$onKeyUp].bind(this);

    this.open = false;
    this.showArrow = false;
    this.depth = 0;
    this.root = false;
    this.selected = false;

    // Non-managed properties
    this.currentSelection = null;
    this[$listening] = false;
    this[$connected] = false;
  }

  connectedCallback() {
    super.connectedCallback();
    this[$connected] = true;
    this[$addListeners]();
  }

  disconnectedCallback() {
    this[$removeListeners]();
    this[$connected] = false;
    super.disconnectedCallback();
  }

  shouldUpdate(changed) {
    if (changed.has('root')) {
      if (this.root) {
        this[$addListeners]();
      } else {
        this[$removeListeners]();
      }
    }

    if (changed.has('selected') && this.selected) {
      this.dispatchEvent(new CustomEvent('tree-item-select', {
        detail: {},
        bubbles: true,
        composed: true
      }));
    }

    return true;
  }

  getTreeItemChildren() {
    return this.shadowRoot.querySelector('#children').assignedElements();
  }

  // https://medium.com/dev-channel/focus-inside-shadow-dom-78e8a575b73
  [$onKeyUp](e) {
    if (!this.root) {
      console.log('%c onKeyUp on non root', 'color:red');
      // @TODO see $onTreeItemSelect
      return;
    }

    if (!this.currentSelection) {
      return;
    }

    const open = this.currentSelection.open;
    let parent = this.currentSelection.parentElement;
    let parentNext = parent ? parent.nextElementSibling : null;
    let children = this.currentSelection.getTreeItemChildren();
    let next = this.currentSelection.nextElementSibling;
    let previous = this.currentSelection.previousElementSibling;
    let previousLastChild = null;

    // Filter out the edges of the DOM by ensuring these
    // related nodes are all tree items.
    if (!parent || !parent.getTreeItemChildren) {
      parent = null;
    }
    if (!parentNext || !parentNext.getTreeItemChildren) {
      parentNext = null;
    }
    if (!next || !next.getTreeItemChildren) {
      next = null;
    }
    if (!previous || !previous.getTreeItemChildren) {
      previous = null;
    }
    if (previous) {
      const previousChildren = previous.getTreeItemChildren();
      previousLastChild = previousChildren.length ? previousChildren[previousChildren.length - 1] : null;
    }

    let newSelection = null;
    switch(e.key) {
      case 'ArrowLeft':
        if (open && children.length) {
          this.currentSelection.open = false;
        } else if (parent) {
          newSelection = parent;
        }
        break;
      case 'ArrowRight':
        if (open && children.length) {
          newSelection = children[0];
        } else if (!open && children.length) {
          this.currentSelection.open = true;
        }
        break;
      case 'ArrowDown':
        if (open && children.length) {
          newSelection = children[0];
        } else if (next) {
          newSelection = next;
        } else if (parentNext) {
          newSelection = parentNext;
        }
        break;
      case 'ArrowUp':
        if (previous) {
          if (previous.open && previousLastChild) {
            newSelection = previousLastChild;
          } else {
            newSelection = previous;
          }
        } else if (parent) {
          newSelection = parent;
        }
        break;
    }

    if (newSelection) {
      newSelection.selected = true;
    }
  }

  [$onVisibilityToggle](e) {
    e.stopPropagation();
    this.open = !this.open;
  }

  [$onClick](e) {
    e.stopPropagation();
    this.selected = true;
  }

  [$onDoubleClick](e) {
    e.stopPropagation();
    this.open = !this.open;
  }

  /**
   * A tree item in this root's descendents has been
   * selected. Update the styling here before further
   * propogation.
   */
  [$onTreeItemSelect](e) {
    if (!this.root) {
      // @TODO I think LitElement is autocalling this handler
      // on the selected element (that dispatches this event)
      // with the context of the selected element, even though the
      // handler is *only* bound to the root element.
      return;
    }

    const selected = e.composedPath()[0];

    console.log("*** on tree item selected", this.getAttribute('uuid'));
    console.log(this, selected, this.currentSelection);
    // If there's been a change in the selection,
    // update the store and allow the event to
    // propagate outside.
    if (selected !== this.currentSelection) {
      if (this.currentSelection) {
        this.currentSelection.selected = false;
      }
      this.currentSelection = selected;
      this.currentSelection.focus();
    } else {
      e.stopPropagation();
    }
  }

  [$addListeners]() {
    if (this.root && this[$connected] && !this[$listening]) {
      console.log('listening to key up', this.getAttribute('uuid'));
      // @TODO How can we be smarter about binding key events?
      // 1) Could enable as an attribute on root element e.g. "key-events"
      // 2) Could rely on having focus on the root tree element (or some object with focus)
      this.addEventListener('keyup', this[$onKeyUp]);
      this.addEventListener('tree-item-select', this[$onTreeItemSelect]);
      this[$listening] = true;
    }
  }

  [$removeListeners]() {
    this.removeEventListener('keyup', this[$onKeyUp]);
    this.removeEventListener('tree-item-select', this[$onTreeItemSelect]);
    this[$listening] = false;
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
    height: auto;
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

  /* @TODO A way to have a root element with many children rather than this... */
  :host([depth="-1"]) .row {
    display: none;
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

  .arrow-block {
    height: 100%;
    flex: 0 0 24px;
    background-color: transparent;
    border: 0;
    padding: 0;
    position: relative;
    pointer-events: none;
  }

  .arrow {
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 3px 0 3px 6px;
    /* @TODO this color needs to be variablized */
    border-color: transparent transparent transparent var(--title-color);
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  :host([show-arrow]) .arrow {
    display: inline-block;
  }
  :host([open]) .arrow {
    transform: translate(-50%, -50%) rotate(90deg);
  }
  :host([selected]) .arrow {
    /* @TODO this color needs to be variablized */
    border-color: transparent transparent transparent var(--tree-item-selected-color);
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
  @click="${this[$onClick]}"
  @dblclick="${this[$onDoubleClick]}">
  <div class="arrow-block">
      <div class="arrow" @click="${this[$onVisibilityToggle]}"></div>
  </div>
  <slot name="content"></slot>
</div>
<slot id="children"></slot>
`;
  }
}
