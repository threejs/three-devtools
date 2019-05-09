import BaseElement, { html } from '../BaseElement.js';
import { hexNumberToCSSString } from '../../utils.js';

const $onActivate = Symbol('onActivate');

export default class MaterialValueElement extends BaseElement {
  static get typeHint() { return 'material'; }

  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  render() {
    const material = this.getEntity();

    if (!material) {
      return null;
    }

    const color = material.color ? hexNumberToCSSString(material.color) : 'white';
    return html`
<style>
  :host {
    cursor: pointer;
  }

  .wrapper {
    height: auto;
    width: 100%;
    display: flex;

  }

  #icon {
    flex: 0 0 10px;
    height: 10px;
    width: 10px;
    border: 1px solid black;
  }
  #name {
    padding-left: 10px;
    flex: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
</style>
<div class="wrapper" @click="${this[$onActivate]}">
  <div id="icon" style="background-color:${color}"></div>
  <div id="name">${material.type}</div>
</div>
`;
  }

  [$onActivate](e) {
    this.app.dispatchEvent(new CustomEvent('select-object', { detail: {
      uuid: this.uuid,
      typeHint: 'material',
    }}));
  }
}
