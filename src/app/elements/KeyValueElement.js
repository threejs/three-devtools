import { LitElement, html } from '../../../web_modules/lit-element.js'

export default class KeyValueElement extends LitElement {
  static get properties() {
    return {
      // @TODO probably should use less generic/collision-y
      // attribute names.
      keyName: { type: String, reflect: true, attribute: 'key-name'},
      value: { type: String, reflect: true },
      type: { type: String, reflect: true },
    }
  }

  render() {

    let valueElement;

    switch (this.type) {
      case 'string':
        valueElement = this.value;
        break;
      case 'vec3':
        valueElement = this.value;
        break;
      case 'material':
        valueElement = html`<material-value uuid=${this.value}></material-value>`;
        break;
      default:
        valueElement = this.value;
    }

    return html`
<style>
  /**
   * Current CSS API:
   *
   * --key-value-divider-position: 20%;
   * --key-value-padding-left: 10px;
   */

  :host {
    height: auto;
    width: 100%;
    display: flex;
  }

  #key {
    flex: 0 0 var(--key-value-divider-position, 20%);
  }
  #value {
    flex: 1;
  }

  #key, #value {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-left: var(--key-value-padding-left, 10px);
  }

</style>
<div id="key">${this.keyName}</div>
<div id="value">${valueElement}</div>
`;
  }
}
