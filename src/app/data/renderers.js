const ToneMapping = {
  name: 'Tone Mapping',
  type: 'group',
  props: [{
    // @TODO
    name: 'Type',
    prop: 'toneMapping',
    type: 'enum',
    enumType: 'toneMapping',
  }, {
    name: 'Exposure',
    prop: 'toneMappingExposure',
    type: 'number',
    default: 1,
  }],
};

const ShadowMap = {
  name: 'Shadow Map',
  type: 'group',
  props: [{
    name: 'Enabled',
    prop: 'shadowMap.enabled',
    type: 'boolean',
    default: false,
  }, {
    name: 'Auto Update',
    prop: 'shadowMap.autoUpdate',
    type: 'boolean',
    default: true,
  }, {
    // @TODO enum 
    name: 'Shadow Type',
    prop: 'shadowMap.type',
    type: 'enum',
    enumType: 'shadowMap',
  }],
};

const BufferClearing = {
  name: 'Buffer Clearing',
  type: 'group',
  props: [{
    name: 'Auto Clear',
    prop: 'autoClear',
    type: 'boolean',
    default: true,
  }, {
    name: 'Auto Clear Color',
    prop: 'autoClearColor',
    type: 'boolean',
    default: true,
  }, {
    name: 'Auto Clear Depth',
    prop: 'autoClearDepth',
    type: 'boolean',
    default: true,
  }, {
    name: 'Auto Clear Stencil',
    prop: 'autoClearStencil',
    type: 'boolean',
    default: true,
  }]
};


// Does not have a further classification yet
const Capabilities = {
  name: 'Capabilities',
  type: 'group',
  props: [{
    name: 'Is WebGL2',
    prop: 'capabilities.isWebGL2',
    type: 'boolean',
    readonly: true,
  }, {
    name: 'Precision',
    prop: 'capabilities.precision',
    type: 'string',
    readonly: true,
  }, {
    name: 'Float Fragment Textures',
    prop: 'capabilities.floatFragmentTextures',
    type: 'boolean',
    readonly: true,
  }, {
    name: 'Float Vertex Textures',
    prop: 'capabilities.floatVertexTextures',
    type: 'boolean',
    readonly: true,
  }, {
    name: 'Logarithmic Depth Buffer',
    prop: 'capabilities.logarithmicDepthBuffer',
    type: 'boolean',
    readonly: true,
  }, {
    name: 'Max Anisotropy',
    prop: 'capabilities.maxAnisotropy',
    type: 'number',
    readonly: true,
  }, {
    name: 'Max Precision',
    prop: 'capabilities.maxPrecision',
    type: 'string',
    readonly: true,
  }, {
    name: 'Max Attributes',
    prop: 'capabilities.maxAttributes',
    type: 'int',
    readonly: true,
  }, {
    name: 'Max Cubemap Size',
    prop: 'capabilities.maxCubemapSize',
    type: 'int',
    readonly: true,
  }, {
    name: 'Max Fragment Uniforms',
    prop: 'capabilities.maxFragmentUniforms',
    type: 'int',
    readonly: true,
  }, {
    name: 'Max Texture Size',
    prop: 'capabilities.maxTextureSize',
    type: 'int',
    readonly: true,
  }, {
    name: 'Max Textures',
    prop: 'capabilities.maxTextures',
    type: 'int',
    readonly: true,
  }, {
    name: 'Max Varyings',
    prop: 'capabilities.maxVaryings',
    type: 'int',
    readonly: true,
  }, {
    name: 'Max Vertex Textures',
    prop: 'capabilities.maxVertexTextures',
    type: 'int',
    readonly: true,
  }, {
    name: 'Max Vertex Uniforms',
    prop: 'capabilities.maxVertexUniforms',
    type: 'int',
    readonly: true,
  }, {
    name: 'Vertex Textures',
    prop: 'capabilities.vertexTextures',
    type: 'boolean',
    readonly: true,
  }]
};

// @TODO clippingPlanes
const Clipping = {
  name: 'Clipping',
  type: 'group',
  props: [{
    name: 'Local Clipping',
    prop: 'localClippingEnabled',
    type: 'boolean',
    default: false,
  }],
};

const Scene = {
  name: 'Scene',
  type: 'group',
  props: [{
    name: 'Sort Objects',
    prop: 'sortObjects',
    type: 'boolean',
    default: true,
  }],
};

const MorphLimits = {
  name: 'Morph Limits',
  type: 'group',
  props: [{
    name: 'Max Morph Targets',
    prop: 'maxMorphTargets',
    type: 'int',
    default: 8,
    min: 0,
    max: 8,
  }, {
    name: 'Max Morph Normals',
    prop: 'maxMorphNormals',
    type: 'int',
    default: 4,
    min: 0,
    max: 4,
  }],
};

const WebGLRenderer = {
  type: 'renderer',
  props: [
  {
    name: 'Check Shader Errors',
    prop: 'debug.checkShaderErrors',
    type: 'boolean',
    default: true,
  }, {
    name: 'Physically Correct Lights',
    prop: 'physicallyCorrectLights',
    type: 'boolean',
    default: false,
  }, {
    name: 'Gamma',
    prop: 'gammaFactor',
    type: 'number',
    default: 2,
  }, {
    name: 'Output Encoding',
    prop: 'outputEncoding',
    type: 'enum',
    enumType: 'encoding',
  },
    ToneMapping,
    ShadowMap,
    BufferClearing,
    Capabilities,
    Clipping,
    Scene,
    MorphLimits,
  ],
};

export default {
  WebGLRenderer: WebGLRenderer,
  WebGL1Renderer: WebGLRenderer,
};
