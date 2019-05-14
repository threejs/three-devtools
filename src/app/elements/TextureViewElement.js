import BaseElement, { html } from './BaseElement.js';

const typeToTextureType = {
};

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

    const textureHint = typeToTextureType[texture.type];

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
  accordion-view {
    display: flex;
    flex-direction: column;
    min-height: 20px;
  }

  image-preview {
    transform: translateX(-50%);
    left: 50%;
    position: relative;
    width: 50%;
  }

  .basic, .depth, .distance, .lambert, .physical, .standard {
    display: none;
  }
  [material-hint="linedashed"] .linedashed
  {
    display: flex;
  }
</style>
<title-bar title="Texture View"></title-bar>
<image-preview uuid="${texture.image}"></image-preview>
<div class="properties" texture-hint="${textureHint}">
  <key-value uuid="${this.uuid}" key-name="UUID" .value="${texture.uuid}" type="string" property="uuid"></key-value>
  <key-value uuid="${this.uuid}" key-name="Version" .value="${texture.version || 0}" type="number" property="version"></key-value>
  <key-value uuid="${this.uuid}" key-name="Mapping" .value="${texture.mapping}" type="enum" property="mapping"></key-value>
  <key-value uuid="${this.uuid}" key-name="Wrap S" .value="${texture.wrapS}" type="enum" property="wrapS"></key-value>
  <key-value uuid="${this.uuid}" key-name="Wrap T" .value="${texture.wrapT}" type="enum" property="wrapT"></key-value>
  <key-value uuid="${this.uuid}" key-name="Mag Filter" .value="${texture.magFilter}" type="enum" property="magFilter"></key-value>
  <key-value uuid="${this.uuid}" key-name="Min Filter" .value="${texture.minFilter}" type="enum" property="minFilter"></key-value>
  <key-value uuid="${this.uuid}" key-name="Anisotropy" .value="${texture.anisotropy}" type="number" property="anisotropy"></key-value>
  <key-value uuid="${this.uuid}" key-name="Format" .value="${texture.format}" type="enum" property="format"></key-value>
  <key-value uuid="${this.uuid}" key-name="Byte Type" .value="${texture.type}" type="enum" property="type"></key-value>
  <key-value uuid="${this.uuid}" key-name="Encoding" .value="${texture.encoding}" type="enum" property="encoding"></key-value>
  <key-value uuid="${this.uuid}" key-name="Flip Y" .value="${!(texture.flipY === false)}" type="boolean" property="flipY"></key-value>
  <key-value uuid="${this.uuid}" key-name="Generate Mipmaps" .value="${!(texture.generateMipmaps === false)}" type="boolean" property="generateMipmaps"></key-value>
  <key-value uuid="${this.uuid}" key-name="Premultiply Alpha" .value="${texture.premultiplyAlpha || false}" type="boolean" property="premultiplyAlpha"></key-value>
  <key-value uuid="${this.uuid}" key-name="Unpack Alignment" .value="${texture.unpackAlignment || 4}" type="number" property="unpackAlignment"></key-value>
  <key-value uuid="${this.uuid}" key-name="Offset" .value="${texture.offset}" type="vec2" property="offset"></key-value>
  <key-value uuid="${this.uuid}" key-name="Repeat" .value="${texture.repeat}" type="vec2" property="repeat"></key-value>
  <key-value uuid="${this.uuid}" key-name="Rotation" .value="${texture.rotation || 0}" type="number" property="rotation"></key-value>
  <key-value uuid="${this.uuid}" key-name="Center" .value="${texture.center}" type="vec2" property="center"></key-value>
  <key-value uuid="${this.uuid}" key-name="Matrix Auto Update" .value="${!(texture.matrixAutoUpdate === false)}" type="boolean" property="matrixAutoUpdate"></key-value>
  
</div>
`;
  }
}
