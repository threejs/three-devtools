export const MaterialTypes = [
  'Material',
  'LineBasicMaterial',
  'LineDashedMaterial',
  'MeshBasicMaterial',
  'MeshDepthMaterial',
  'MeshDistanceMaterial',
  'MeshLambertMaterial',
  'MeshMatcapMaterial',
  'MeshNormalMaterial',
  'MeshPhongMaterial',
  'MeshPhysicalMaterial',
  'MeshStandardMaterial',
  'MeshToonMaterial',
  'PointsMaterial',
  'RawShaderMaterial',
  'ShaderMaterial',
  'ShadowMaterial',
  'SpriteMaterial'
];

// Defaults go first, and applied if undefined
const ConstantTypes = {
  drawMode: [
    'TrianglesDrawMode',
    'TriangleStripDrawMode',
    'TriangleFanDrawMode'
  ],
  side: [
    'FrontSide',
    'BackSide',
    'DoubleSide'
  ],
  colors: [
    'NoColors',
    'FaceColors',
    'VertexColors'
  ],
  blending:[
    'NormalBlending',
    'NoBlending',
    'AdditiveBlending',
    'SubtractiveBlending',
    'MultiplyBlending',
    'CustomBlending'
  ],
  blendEquation: [
    'AddEquation',
    'SubtractEquation',
    'ReverseSubtractEquation',
    'MinEquation',
    'MaxEquation'
  ],
  blendDst: [
    'OneMinusSrcAlphaFactor',
    'ZeroFactor',
    'OneFactor',
    'SrcColorFactor',
    'OneMinusSrcColorFactor',
    'SrcAlphaFactor',
    'DstAlphaFactor',
    'OneMinusDstAlphaFactor',
    'DstColorFactor',
    'OneMinusDstColorFactor'
  ],
  blendSrc: [
    'OneMinusSrcAlphaFactor',
    'ZeroFactor',
    'OneFactor',
    'SrcColorFactor',
    'OneMinusSrcColorFactor',
    'SrcAlphaFactor',
    'DstAlphaFactor',
    'OneMinusDstAlphaFactor',
    'DstColorFactor',
    'OneMinusDstColorFactor',
    'SrcAlphaSaturateFactor'
  ],
  depthFunc: [
    'LessEqualDepth',
    'NeverDepth',
    'AlwaysDepth',
    'LessDepth',
    'GreaterEqualDepth',
    'GreaterDepth',
    'NotEqualDepth'
  ],
  combine: [
    'MultiplyOperation',
    'MixOperation',
    'AddOperation',
  ],
  vertexColors: [
    'NoColors',
    'VertexColors',
    'FaceColors',
  ],
  normalMapType: [
    'TangentSpaceNormalMap',
    'ObjectSpaceNormalMap',
  ],
  encoding: [
    'LinearEncoding',
    'sRGBEncoding',
    'GammaEncoding',
    'RGBEEncoding',
    'LogLuvEncoding',
    'RGBM7Encoding',
    'RGBM16Encoding',
    'RGBDEncoding',
    'BasicDepthPacking',
    'RGBADepthPacking'
  ],
};

// Copy some over since the constant type is found
// by property name.
ConstantTypes.shadowSide = ConstantTypes.side;
// Change default (first in order) when encoding is used as `depthPacking`
ConstantTypes.depthPacking = [...ConstantTypes.encoding];
ConstantTypes.depthPacking[ConstantTypes.depthPacking.indexOf('BasicDepthPacking')] =
  ConstantTypes.depthPacking[0];
ConstantTypes.depthPacking[0] = 'BasicDepthPacking';

export { ConstantTypes };
