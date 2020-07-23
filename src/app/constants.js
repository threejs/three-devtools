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

export const ObjectTypes = [
 'Mesh',
 'Line',
 'LineLoop',
 'LineSegments',
 'AmbientLight',
 'DirectionalLight',
 'HemisphereLight',
 'PointLight',
 'RectAreaLight',
 'SpotLight',
 'ArrowHelper',
 'AxesHelper',
 'BoxHelper',
 'Box3Helper',
 'CameraHelper',
 'DirectionalLightHelper',
 'FaceNormalsHelper',
 'GridHelper',
 'PolarGridHelper',
 'PositionalAudioHelper',
 'HemisphereLightHelper',
 'PlaneHelper',
 'PointLightHelper',
 'RectAreaLightHelper',
 'SkeletonHelper',
 'SpotLightHelper',
 'VertexNormalsHelper',
 'Skeleton',
 'Bone',
 'Group'
];

// Defaults go first, and applied if undefined
const ConstantTypes = {
  mapping: [
    'UVMapping',
    'CubeReflectionMapping',
    'CubeRefractionMapping',
    'EquirectangularReflectionMapping',
    'EquirectangularRefractionMapping',
    'SphericalReflectionMapping',
    'CubeUVReflectionMapping',
    'CubeUVRefractionMapping',
  ],
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
  format: [
    'RGBAFormat',
    'AlphaFormat',
    'RGBFormat',
    'LuminanceFormat',
    'LuminanceAlphaFormat',
    'RGBEFormat',
    'DepthFormat',
    'DepthStencilFormat'
  ],
  type: [
    'UnsignedByteType',
    'ByteType',
    'ShortType',
    'UnsignedShortType',
    'IntType',
    'UnsignedIntType',
    'FloatType',
    'HalfFloatType',
    'UnsignedShort4444Type',
    'UnsignedShort5551Type',
    'UnsignedShort565Type',
    'UnsignedInt248Type',
  ],
  wrapping: [
    'ClampToEdgeWrapping',
    'RepeatWrapping',
    'MirroredRepeatWrapping',
  ],
  magFilter: [
    'LinearFilter',
    'NearestFilter',
  ],
  minFilter: [
    'LinearMipMapLinearFilter',
    'NearestFilter',
    'NearestMipMapNearestFilter',
    'NearestMipMapLinearFilter',
    'LinearFilter',
    'LinearMipMapNearestFilter',
  ],
  toneMapping: [
    'NoToneMapping',
    'LinearToneMapping',
    'ReinhardToneMapping',
    'Uncharted2ToneMapping',
    'CineonToneMapping',
    'ACESFilmicToneMapping',
  ],
  shadowMap: [
    'BasicShadowMap',
    'PCFShadowMap',
    'PCFSoftShadowMap',
    'VSMShadowMap',
  ],
};

// Copy some over since the constant type is found
// by property name.
ConstantTypes.shadowSide = ConstantTypes.side;
ConstantTypes.blendSrcAlpha = ['null', ...ConstantTypes.blendSrc];
ConstantTypes.blendDstAlpha = ['null', ...ConstantTypes.blendDst];
ConstantTypes.blendEquationAlpha = ['null', ...ConstantTypes.blendEquation];
// Change default (first in order) when encoding is used as `depthPacking`
ConstantTypes.depthPacking = [...ConstantTypes.encoding];
ConstantTypes.depthPacking[ConstantTypes.depthPacking.indexOf('BasicDepthPacking')] =
  ConstantTypes.depthPacking[0];
ConstantTypes.depthPacking[0] = 'BasicDepthPacking';

export { ConstantTypes };
