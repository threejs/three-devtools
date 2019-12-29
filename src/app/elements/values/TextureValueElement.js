import { LitElement, html } from '../../../../web_modules/lit-element.js'
import { getEntityName } from '../../utils.js';

const $onActivate = Symbol('onActivate');

export default class TextureValueElement extends LitElement {

  static get properties() {
    return {
    }
  }

  render() {
    const texture = null;

    if (!texture) {
      return null;
    }

    const name = getEntityName(texture);
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
  <div id="icon" style="background-image:url(${texture.image})"></div>
  <div id="name">${name}</div>
</div>
`;
  }

  [$onActivate](e) {
    this.app.dispatchEvent(new CustomEvent('select-entity', { detail: {
      uuid: this.uuid,
    }}));
  }
}
