import { LitElement, html } from '../../../web_modules/lit-element.js'

const icons = {
  "close": { sheet: "large", position: "-84px 0px" },
  "visibility": { sheet: "large", position: "28px 0px" },
  "add": { sheet: "large", position: "0px -24px" },
  "check": { sheet: "large", position: "-54px -24px" },
  "shadow": { sheet: "large", position: "0px -48px" },
  "camera": { sheet: "large", position: "-28px -48px" },
  "settings": { sheet: "large", position: "56px -48px" },
  "undo": { sheet: "large", position: "28px -48px" },
  "edit": { sheet: "large", position: "0px -96px" },
  "filter": { sheet: "large", position: "-56px -96px" },
  "menu": { sheet: "large", position: "-56px -120px" },
  "search": { sheet: "large", position: "28px -120px" },
  "refresh": { sheet: "large", position: "-84px 48px" },
};

const sizes = {
  "large": "width: 28px; height: 24px"
}

export default class DevtoolsIconElement extends LitElement {
  static get properties() {
    return {
      "icon": { type: String, reflect: true }
    }
  }

  render() {
    const icon = icons[this.icon || "refresh"];
    return html`
<style>
:host {
  display: inline-block;
  flex-shrink: 0;
  ${sizes[icon.sheet]};
  background-color: rgb(145, 145, 145);
  -webkit-mask-position: ${icon.position};
          mask-position: ${icon.position};
  -webkit-mask-image: -webkit-image-set(url(assets/${icon.sheet}Icons.png) 1x, url(assets/${icon.sheet}Icons_2x.png) 2x);
          mask-image: url(assets/${icon.sheet}Icons.png);
}
</style>
`;
  }
}
