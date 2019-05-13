import BaseElement, { html } from './BaseElement.js';

export default class TextureViewElement extends BaseElement {
  static get typeHint() { return 'texture'; }
  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  render() {
    const texture = this.getEntity();

    if (!texture) {
      return html`<div>no texture</div>`;
    }

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
<title-bar title="Texture View"></title-bar>
<div class="properties">
  <key-value key-name="Type" value="${texture.type}" type="string"></key-value>
  <key-value key-name="UUID" value="${texture.uuid}" type="string"></key-value>
  <key-value editable key-name="Format" value="${texture.format}" type="enum"></key-value>
  <key-value editable key-name="Encoding" value="${texture.encoding}" type="enum"></key-value>
  <key-value key-name="Image" value="${texture.image}" type="image"></key-value>
  <key-value editable key-name="Repeat" value="${texture.repeat}" type="vec2"></key-value>
  <key-value editable key-name="Offset" value="${texture.offset}" type="vec2"></key-value>
  <key-value editable key-name="Center" value="${texture.center}" type="vec2"></key-value>
  <key-value editable key-name="Wrap" value="${texture.wrap}" type="vec2"></key-value>
  <key-value editable key-name="MinFilter" value="${texture.minFilter}" type="enum"></key-value>
  <key-value editable key-name="MagFilter" value="${texture.magFilter}" type="enum"></key-value>
  <key-value editable key-name="Anisotropy" value="${texture.anisotropy}" type="number"></key-value>
  <key-value editable key-name="Flip Y" value="${texture.flipY}" type="boolean"></key-value>
  <key-value editable key-name="Premultiply Alpha" value="${texture.premultiplyAlpha}" type="boolean"></key-value>
  <key-value editable key-name="Unpack Alignment" value="${texture.unpackAlignment}" type="boolean"></key-value>
</div>
`;
  }
}
