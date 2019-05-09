import { LitElement, html } from '../../../web_modules/lit-element.js'
import BaseElement from './BaseElement.js';

const $onActivate = Symbol('onActivate');

export default class MaterialValueElement extends BaseElement {
  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  render() {
    const material = this.app.getObject(this.uuid);

    if (!material) {
      return null;
    }

    return html`
<style>
  :host {
    height: auto;
    width: 100%;
    display: flex;
  }

  #icon {
    flex: 0 0 var(--key-value-divider-position, 20%);
    padding-left: var(--key-value-padding-left, 10px);
  }
  #name {
    flex: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    padding-left: var(--key-value-padding-left, 10px);
  }
</style>
<div class="wrapper" @dblclick="${this[$onActivate]}">
  <div id="icon">icon</div>
  <div id="name">${material.name}</div>
</div>
`;
  }

  [$onActivate](e) {
    console.log('click material', e);
    this.app.dispatchEvent(new CustomEvent('select-object', { detail: {
      uuid: this.uuid,
      type: 'material',
    }}));
  }
}
