import { LitElement, html } from '../../../web_modules/lit-element.js'
import IconStyles from '../elements/shared-styles/ui-icon.js'

export default class DevtoolsIconButtonElement extends LitElement {
  static get properties() {
    return {
      "sheet-variant": { type: String, reflect: true },
      "icon-style": { type: String, reflect: true }
    }
  }

  render() {
    return html`
<style>
  :host {
    color: inherit;
    flex: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
  }

  :host > button {
    border: none;
    background-color: transparent;
    padding: 0;
  }

  :host > button:focus {
    outline-width: 0;
  }

  :host > button:enabled:hover:not(:active) span {
    background-color: rgb(204, 204, 204);
  }

  ${IconStyles}
</style>
<button>
  <span is="ui-icon" class="toolbar-glyph spritesheet-${this["sheet-variant"]}icons ${this["sheet-variant"]}icon-menu icon-mask" style="${this["icon-style"]}"></span>
</button>
`;
  }
}
