const Filters = {
  name: 'Filters',
  type: 'group',
  props: [{
    name: 'Min Filter',
    prop: 'minFilter',
    type: 'enum',
  }, {
    name: 'Mag Filter',
    prop: 'magFilter',
    type: 'enum',
  }]
};

const Wrapping = object => ({
  name: 'Wrapping',
  type: 'group',
  props: [{
    name: 'Wrap S',
    prop: 'wrapS',
    type: 'enum',
  }, {
    name: 'Wrap T',
    prop: 'wrapT',
    type: 'enum',
  }, {
    name: 'Wrap R',
    prop: 'wrapR',
    type: 'enum',
  }].filter(p => p.prop === 'wrapR' ?
    object.textureType === 'DepthTexture' :
    true)
});

const Transform = {
  name: 'Transform',
  type: 'group',
  props: [{
    name: 'Offset',
    prop: 'offset',
    type: 'vec2',
  }, {
    name: 'Repeat',
    prop: 'repeat',
    type: 'vec2',
  }, {
    name: 'Rotation',
    prop: 'rotation',
    type: 'radians',
  }, {
    name: 'Center',
    prop: 'center',
    type: 'vec2',
  }, {
    name: 'matrixAutoUpdate',
    prop: 'matrixAutoUpdate',
    type: 'boolean',
    default: true,
  }, {
    name: 'Matrix',
    prop: 'matrix',
    type: 'mat3',
  }]
};

const Texture = {
  type: 'texture',
  props: [{
    name: 'Mapping',
    prop: 'mapping',
    type: 'enum',
  }, {
    name: 'Encoding',
    prop: 'encoding',
    type: 'enum',
  }, {
    name: 'Format',
    prop: 'format',
    type: 'enum',
  }, {
    name: 'Byte Type',
    prop: 'type',
    type: 'enum',
  }, {
    name: 'Anisotropy',
    prop: 'anisotropy',
    type: 'number',
  }, {
    name: 'Flip Y',
    prop: 'flipY',
    type: 'boolean',
    default: true,
  }, {
    name: 'Generate Mipmaps',
    prop: 'generateMipmaps',
    type: 'boolean',
    default: true,
  }, {
    name: 'Premultiply Alpha',
    prop: 'premultiplyAlpha',
    type: 'boolean',
    default: false,
  },
  Filters,
  Wrapping,
  Transform,
  ]
}

export default {
  Texture: Texture,
  CanvasTexture: Texture,
  CompressedTexture: Texture,
  CubeTexture: Texture,
  DataTexture: Texture,
  DataTexture2DArray: Texture,
  DataTexture3D: Texture,
  DepthTexture: Texture,
  VideoTexture: Texture,
}