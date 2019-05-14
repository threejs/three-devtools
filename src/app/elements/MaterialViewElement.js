import BaseElement, { html } from './BaseElement.js';

const typeToMaterialType = {
  'MeshBasicMaterial': 'basic',
};

export default class MaterialViewElement extends BaseElement {
  static get typeHint() { return 'material'; }
  static get properties() {
    return {
      ...BaseElement.properties,
    }
  }

  constructor() {
    super();

  }

  render() {
    const material = this.getEntity();

    if (!material) {
      return html`<div>no material</div>`;
    }

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
</style>
<title-bar title="Material View"></title-bar>
<div class="properties">
  <key-value uuid="${this.uuid}" key-name="Type" .value="${material.type}" type="string" property="type"></key-value>
  <key-value uuid="${this.uuid}" key-name="UUID" .value="${material.uuid}" type="string" property="uuid"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Color" .value="${material.color}" type="color" property="color"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Side" .value="${material.side}" type="enum" property="side"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Transparent" .value="${material.transparent || false}" type="boolean" property="transparent"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Visible" .value="${!(material.visible === false)}" type="boolean" property="visible"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Opacity" value="${material.opacity || 0}" type="number" property="opacity"></key-value>

  <key-value editable uuid="${this.uuid}" key-name="Emissive" value="${material.emissive}" type="color" property="emissive"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Environment Map" value="${material.envMap}" type="texture" property="envMap"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Environment Intensity" value="${material.envMapIntensity}" type="number" property="envMapIntensity"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Metalness" value="${material.metalness}" type="number" property="metalness"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Roughness" value="${material.roughness}" type="number" property="roughness"></key-value>

  <accordion-view><div slot="content">Advanced Properties</div>
    <key-value editable uuid="${this.uuid}" key-name="Color Write" value="${!(material.colorWrite === false)}" type="boolean" property="colorWrite"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Depth Func" .value="${material.depthFunc}" type="enum" property="depthFunc"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Depth Test" .value="${material.depthTest}" type="boolean" property="depthTest"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Depth Write" value="${material.depthWrite}" type="boolean" property="depthWrite"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Lights" value="${material.lights || false}" type="boolean" property="lights"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Flat Shading" value="${material.flatShading || false }" type="boolean" property="flatShading"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Fog" value="${material.fog || false }" type="boolean" property="fog"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Dithering" .value="${material.dithering || false}" type="boolean" property="dithering"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Clip Intersection" .value="${material.clipIntersection || false}" type="boolean" property="clipIntersection"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Clip Shadows" value="${material.clipShadows || false}" type="boolean" property="clipShadows"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Shadow Side" .value="${material.shadowSide}" type="enum" property="shadowSide"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Vertex Colors" .value="${material.vertexColors}" type="enum" property="vertexColors"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Vertex Tangents" .value="${material.vertexTangents}" type="boolean" property="vertexTangents"></key-value>
  </accordion-view>

  <accordion-view>
    <div slot="content">Blending</div>
    <key-value editable uuid="${this.uuid}" key-name="Alpha Test" .value="${material.alphaTest || 0}" type="number" property="alphaTest"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Blend Destination" .value="${material.blendDst}" type="enum" property="blendDst"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Blend Destination Alpha" .value="${material.blendDstAlpha || 0}" type="number" property="blendDstAlpha"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Blend Equation" .value="${material.blendEquation}" type="enum" property="blendEquation"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Blend Equation Alpha" .value="${material.blendEquationAlpha || 0}" type="number" property="blendEquationAlpha"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Blending" .value="${material.blending}" type="enum" property="blending"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Blending Source" .value="${material.blendSrc}" type="enum" property="blendSrc"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Blending Source Alpha" .value="${material.blendSrcAlpha || 0}" type="enum" property="blendSrcAlpha"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Premultiplied Alpha" .value="${material.premultipliedAlpha || false}" type="boolean" property="premultipliedAlpha"></key-value>
  </accordion-view>

  <accordion-view>
    <div slot="content">Polygon Offset</div>
    <key-value editable uuid="${this.uuid}" key-name="Polygon Offset" .value="${material.polygonOffset || false}" type="boolean" property="polygonOffset"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Polygon Offset Factor" .value="${material.polygonOffsetFactor || 0}" type="number" property="polygonOffsetFactor"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Polygon Offset Units" .value="${material.polygonOffsetUnits || 0}" type="number" property="polygonOffsetUnits"></key-value>
  </accordion-view>
</div>
`;
  }
}
