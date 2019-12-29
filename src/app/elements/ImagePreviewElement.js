import { LitElement, html } from '../../../../web_modules/lit-element.js'

const $onActivate = Symbol('onActivate');
const $onLoad = Symbol('onLoad');

export default class ImagePreviewElement extends LitElement {
  static get properties() {
    return {
      width: { type: Number, reflect: true },
      height: { type: Number, reflect: true },
    }
  }

  constructor() {
    super();
    this.width = 0;
    this.height = 0;
  }

  render() {
    const image = null;//this.getEntity();

    if (!image) {
      return html`None`;
    }

    console.log('render imagepreview',image);
    return html`
<style>
  :host {
    width: 100%;
    display: block;
  }
  img {
    width: 100%;
    height: auto;
    display: block;
  }
  .dimensions {
    text-align: center;
  }
</style>
<img @load="${this[$onLoad]}" @click="${this[$onActivate]}" src="${image.url}" />
<div class="dimensions">${this.width + ' x ' + this.height}</div>
`;
  }

  [$onLoad](e) {
    const image = e.composedPath()[0];
    this.width = image.naturalWidth;
    this.height = image.naturalHeight;
  }

  [$onActivate](e) {
    this.dispatchEvent(new CustomEvent('select-entity', {
      detail: {
        uuid: this.uuid,
      },
      bubbles: true,
      composed: true,
    }));
  }
}
