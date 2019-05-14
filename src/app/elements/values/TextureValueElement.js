import BaseElement, { html } from '../BaseElement.js';

const $onActivate = Symbol('onActivate');

export default class TextureValueElement extends BaseElement {
  static get typeHint() { return 'texture'; }

  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  render() {
    const texture = this.getEntity();

    if (!texture) {
      return null;
    }

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
  <div id="name">${texture.name || '<Texture>'}</div>
</div>
`;
  }

  [$onActivate](e) {
    this.app.dispatchEvent(new CustomEvent('select-object', { detail: {
      uuid: this.uuid,
      typeHint: 'texture',
    }}));
  }
}
