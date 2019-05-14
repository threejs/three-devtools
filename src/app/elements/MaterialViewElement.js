import BaseElement, { html } from './BaseElement.js';

const typeToMaterialType = {
  'MeshBasicMaterial': 'basic',
  'MeshDepthMaterial': 'depth',
  'MeshLambertMaterial': 'lambert',
  'MeshPhysicalMaterial': 'physical',
  'MeshStandardMaterial': 'standard',
  'MeshToonMaterial': 'toon',
  'LineBasicMaterial': 'linebasic',
  'LineDashedMaterial': 'linedashed',

  // @TODO
  'MeshDistanceMaterial': 'distance',
  'MeshMatcapMaterial': 'matcap',
  'MeshNormalMaterial': 'normal',
  'MeshPhongMaterial': 'phong',
  'PointsMaterial': 'points',
  'ShadowMaterial': 'shadow',
  'SpriteMaterial': 'sprite',
  'RawShaderMaterial': 'raw',
  'ShaderMaterial': 'shader',
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

    const materialHint = typeToMaterialType[material.type];

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

  .basic, .depth, .distance, .lambert, .physical, .standard {
    display: none;
  }
  [material-hint="basic"] .basic,
  [material-hint="depth"] .depth,
  [material-hint="distance"] .distance,
  [material-hint="lambert"] .lambert,
  [material-hint="standard"] .standard,
  [material-hint="physical"] .physical,
  [material-hint="physical"] .standard,
  [material-hint="toon"] .toon,
  [material-hint="linebasic"] .linebasic,
  [material-hint="linedashed"] .linedashed
  {
    display: flex;
  }
</style>
<title-bar title="Material View"></title-bar>
<div class="properties" material-hint="${materialHint}">
  <key-value uuid="${this.uuid}" key-name="Type" .value="${material.type}" type="string" property="type"></key-value>
  <key-value uuid="${this.uuid}" key-name="UUID" .value="${material.uuid}" type="string" property="uuid"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Side" .value="${material.side}" type="enum" property="side"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Transparent" .value="${material.transparent || false}" type="boolean" property="transparent"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Visible" .value="${!(material.visible === false)}" type="boolean" property="visible"></key-value>
  <key-value editable uuid="${this.uuid}" key-name="Opacity" .value="${material.opacity || 0}" type="number" property="opacity"></key-value>
  
  <key-value class="basic lambert standard linebasic linedashed" editable uuid="${this.uuid}" key-name="Color" .value="${material.color}" type="color" property="color"></key-value>
  <key-value class="depth" editable uuid="${this.uuid}" key-name="Depth Packing" .value="${material.depthPacking}" type="enum" property="depthPacking"></key-value>

  <key-value class="basic depth lambert" editable uuid="${this.uuid}" key-name="Diffuse Map" .value="${material.map}" type="texture" property="map"></key-value>
  <key-value class="basic depth lambert" editable uuid="${this.uuid}" key-name="Alpha Map" .value="${material.alphaMap}" type="texture" property="alphaMap"></key-value>
  <key-value class="toon" uuid="${this.uuid}" key-name="Gradient Map" .value="${material.gradientMap}" type="texture" property="gradientMap"></key-value>
  <key-value class="linebasic" uuid="${this.uuid}" key-name="Line Width" .value="${material.linewidth === undefined ? 1 : material.linewidth}" type="number" property="linewidth"></key-value>
  <key-value class="linedashed" uuid="${this.uuid}" key-name="Dash Size" .value="${material.dashSize === undefined ? 3 : material.dashSize}" type="number" property="dashSize"></key-value>
  <key-value class="linedashed" uuid="${this.uuid}" key-name="Dash Scale" .value="${material.scale === undefined ? 1 : material.scale}" type="number" property="scale"></key-value>
  <key-value class="linedashed" uuid="${this.uuid}" key-name="Gap Size" .value="${material.gapSize === undefined ? 1 : material.gapSize}" type="number" property="gapSize"></key-value>


  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Ambient Occlusion" .value="${material.aoMap}" type="texture" property="aoMap"></key-value>
  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Ambient Occlusion Intensity" .value="${material.aoMapIntensity !== undefined ? 1 : material.aoMapIntensity}" type="number" property="aoMapIntensity"></key-value>
  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Environment Map" .value="${material.envMap}" type="texture" property="envMap"></key-value>
  <key-value class="standard" editable uuid="${this.uuid}" key-name="Environment Intensity" .value="${material.envMapIntensity}" type="number" property="envMapIntensity"></key-value>
  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Light Map" .value="${material.lightMap}" type="texture" property="lightMap"></key-value>
  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Light Map Intensity" .value="${material.lightMapIntensity}" type="texture" property="lightMapIntensity"></key-value>
  
  <key-value class="standard" editable uuid="${this.uuid}" key-name="Bump Map" .value="${material.bumpMap}" type="texture" property="bumpMap"></key-value>
  <key-value class="standard" editable uuid="${this.uuid}" key-name="Bump Scale" .value="${material.bumpScale !== undefined ? 1 : material.bumpScale}" type="number" property="bumpScale"></key-value>

  <key-value class="lambert" editable uuid="${this.uuid}" key-name="Morph Normals" .value="${material.morphNormals || false}" type="boolean" property="morphNormals"></key-value>
  <key-value class="basic lambert" editable uuid="${this.uuid}" key-name="Morph Targets" .value="${material.morphTargets}" type="boolean" property="morphTargets"></key-value>
  <key-value class="basic lambert physical" editable uuid="${this.uuid}" key-name="Reflectivity" .value="${material.reflectivity === undefined ? 1 : material.reflectivity}" type="number" property="reflectivity"></key-value>
  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Refraction Ratio" .value="${material.refractionRatio === undefined ? 0.98 : material.refractionRatio}" type="number" property="refractionRatio"></key-value>
  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Skinning" .value="${material.skinning || false}" type="boolean" property="skinning"></key-value>
  <key-value class="basic lambert" editable uuid="${this.uuid}" key-name="Specular Map" .value="${material.specularMap}" type="texture" property="specularMap"></key-value>
  <key-value class="basic lambert standard" editable uuid="${this.uuid}" key-name="Wireframe" .value="${material.wireframe || false}" type="boolean" property="wireframe"></key-value>

  <key-value class="lambert standard" editable uuid="${this.uuid}" key-name="Emissive" .value="${material.emissive}" type="color" property="emissive"></key-value>
  <key-value class="lambert" editable uuid="${this.uuid}" key-name="Emissive Intensity" .value="${material.emissiveIntensity}" type="number" property="emissiveIntensity"></key-value>
  <key-value class="standard" editable uuid="${this.uuid}" key-name="Emissive Map" .value="${material.emissiveMap}" type="texture" property="emissiveMap"></key-value>
  
  <key-value class="physical" editable uuid="${this.uuid}" key-name="Clear Coat" .value="${material.clearCoat || 0}" type="number" property="clearCoat"></key-value>
  <key-value class="physical" editable uuid="${this.uuid}" key-name="Clear Coat Roughness" .value="${material.clearCoatRoughness || 0}" type="number" property="clearCoatRoughness"></key-value>

  <key-value class="standard" editable uuid="${this.uuid}" key-name="Metalness" .value="${material.metalness}" type="number" property="metalness"></key-value>
  <key-value class="standard" editable uuid="${this.uuid}" key-name="Metalness Map" .value="${material.metalnessMap}" type="texture" property="metalnessMap"></key-value>
  <key-value class="standard" editable uuid="${this.uuid}" key-name="Roughness" .value="${material.roughness}" type="number" property="roughness"></key-value>
  <key-value class="standard" editable uuid="${this.uuid}" key-name="Roughness Map" .value="${material.roughnessMap}" type="texture" property="roughnessMap"></key-value>

  <accordion-view class="depth distance standard"><div slot="content">Displacement</div>
    <key-value editable uuid="${this.uuid}" key-name="Displacement Map" .value="${material.displacementMap}" type="texture" property="displacementMap"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Displacement Scale" .value="${material.displacementScale === undefined ? 1 : material.displacementScale}" type="number" property="displacementScale"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Displacement Bias" .value="${material.displacementBias || 0}" type="number" property="displacementBias"></key-value>
  </accordion-view>
  
  <accordion-view class="standard"><div slot="content">Normal Map</div>
    <key-value editable uuid="${this.uuid}" key-name="Normal Map" .value="${material.displacementMap}" type="texture" property="displacementMap"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Normal Scale" .value="${material.normalScale || [1,1]}" type="vec2" property="normalScale"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Normal Map Type" .value="${material.normalMapType}" type="enum" property="normalMapType"></key-value>
  </accordion-view>

  <accordion-view><div slot="content">Advanced Properties</div>
    <key-value editable uuid="${this.uuid}" key-name="Color Write" .value="${!(material.colorWrite === false)}" type="boolean" property="colorWrite"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Depth Func" .value="${material.depthFunc}" type="enum" property="depthFunc"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Depth Test" .value="${material.depthTest}" type="boolean" property="depthTest"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Depth Write" .value="${material.depthWrite}" type="boolean" property="depthWrite"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Lights" .value="${material.lights || false}" type="boolean" property="lights"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Flat Shading" .value="${material.flatShading || false }" type="boolean" property="flatShading"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Fog" .value="${material.fog || false }" type="boolean" property="fog"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Dithering" .value="${material.dithering || false}" type="boolean" property="dithering"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Clip Intersection" .value="${material.clipIntersection || false}" type="boolean" property="clipIntersection"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Clip Shadows" .value="${material.clipShadows || false}" type="boolean" property="clipShadows"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Shadow Side" .value="${material.shadowSide}" type="enum" property="shadowSide"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Vertex Colors" .value="${material.vertexColors}" type="enum" property="vertexColors"></key-value>
    <key-value editable uuid="${this.uuid}" key-name="Vertex Tangents" .value="${material.vertexTangents}" type="boolean" property="vertexTangents"></key-value>
  </accordion-view>

  <accordion-view>
    <div slot="content">Blending</div>
    <key-value class="basic" editable uuid="${this.uuid}" key-name="Combine" .value="${material.combine}" type="enum" property="combine"></key-value>
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
