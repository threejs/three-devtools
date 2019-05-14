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
export const ConstantTypes = {
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
  shadowSide: [
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
  mixOperation: [
    'MultiplyOperation',
    'MixOperation',
    'AddOperation',
  ],
  vertexColors: [
    'NoColors',
    'VertexColors',
    'FaceColors',
  ],
};
