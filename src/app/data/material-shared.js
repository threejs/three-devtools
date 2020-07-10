export const color = {
  name: 'Color',
  prop: 'color',
  type: 'color',
};

export const gradientMap = {
  name: 'Gradient Map',
  prop: 'gradientMap',
  type: 'texture',
};

export const combine = {
  name: 'Combine',
  prop: 'combine',
  type: 'enum',
};

export const depthPacking = {
  name: 'Depth Packing',
  prop: 'depthPacking',
  type: 'enum',
};

export const alphaMap = {
  name: 'Alpha Map',
  prop: 'alphaMap',
  type: 'texture',
};

export const matcap = {
  name: 'matcap',
  prop: 'matcap',
  type: 'texture',
}

export const normalMap = {
  type: 'group',
  name: 'Normal Map',
  props: [{
    name: 'Map',
    type: 'texture',
    prop: 'normalMap',
  }, {
    name: 'Scale',
    type: 'vec2',
    prop: 'normalScale',
    default: [1, 1],
  }, {
    name: 'Type',
    type: 'enum',
    prop: 'normalMapType',
  }]
};

export const bumpMap = {
  type: 'group',
  name: 'Bump Map',
  props: [{
    name: 'Map',
    type: 'texture',
    prop: 'bumpMap',
  }, {
    name: 'Scale',
    type: 'texture',
    prop: 'bumpScale',
    default: 1,
  }],
};

export const distance = {
  name: 'Distance',
  type: 'group',
  props: [{
    name: 'referencePosition',
    prop: 'referencePosition',
    type: 'vec3',
  }, {
    name: 'Near Distance',
    prop: 'nearDistance',
    type: 'number',
  }, {
    name: 'Far Distance',
    prop: 'farDistance',
    type: 'number',
  }]
}

export const displacement = {
  type: 'group',
  name: 'Displacement Map',
  props: [{
    name: 'Map',
    type: 'texture',
    prop: 'displacementMap',
  }, {
    name: 'Scale',
    type: 'number',
    prop: 'displacementScale',
    min: 0,
    default: 1,
  }, {
    name: 'Bias',
    type: 'number',
    prop: 'displacementBias',
    min: 0,
    default: 0,
  }]
};

export const diffuseMap = {
  name: 'Diffuse Map',
  prop: 'map',
  type: 'texture',
};

export const ao = {
  name: 'Ambient Occlusion',
  type: 'group',
  props: [{
    name: 'Map',
    prop: 'aoMap',
    type: 'texture',
  }, {
    name: 'Intensity',
    prop: 'aoMapIntensity',
    type: 'number',
    min: 0,
    default: 1,
  }],
};

export const envMap = {
  name: 'Environment Map',
  type: 'texture',
  prop: 'envMap',
};

export const envMapIntensity = {
  name: 'Environment Intensity',
  type: 'number',
  prop: 'envMapIntensity',
  default: 1,
  min: 0,
};

export const lightMap = {
  name: 'Light Map',
  type: 'group',
  props: [{
    name: 'Map',
    prop: 'lightMap',
    type: 'texture',
  }, {
    name: 'Intensity',
    prop: 'lightMapIntensity',
    type: 'number',
    min: 0,
    default: 1,
  }],
};

export const morphNormals = {
  name: 'Morph Normals',
  type: 'boolean',
  prop: 'morphNormals',
  default: false,
}

export const morphTargets = {
  name: 'Morph Targets',
  type: 'boolean',
  prop: 'morphTargets',
  default: false,
}

export const reflectivity = {
  name: 'Reflectivity',
  type: 'number',
  prop: 'reflectivity',
  min: 0,
  max: 1,
  default: 1,
}

export const refractionRatio = {
  name: 'Refraction Ratio',
  type: 'number',
  prop: 'refractionRatio',
  default: 0.98,
  min: 0,
}

export const skinning = {
  name: 'Skinning',
  type: 'boolean',
  prop: 'skinning',
  default: false,
}

export const specularMap = {
  name: 'Specular Map',
  type: 'texture',
  prop: 'specularMap',
}

export const specular = {
  name: 'Specular',
  type: 'group',
  props: [{
    name: 'Color',
    type: 'color',
    prop: 'specular',
  }, {
    name: 'Map',
    type: 'texture',
    prop: 'specularMap',
  }],
};

export const clipping = {
  name: 'Clipping',
  type: 'boolean',
  prop: 'clipping',
  default: false,
}

export const wireframe = {
  name: 'Wireframe',
  type: 'group',
  props: [{
    name: 'Enabled',
    type: 'boolean',
    prop: 'wireframe',
    default: false,
  }, {
    name: 'Line Width',
    type: 'number',
    prop: 'wireframeLinewidth',
    default: 1,
  }, {
    name: 'Line Cap',
    type: 'string',
    prop: 'wireframeLinecap',
    default: 'round',
  }, {
    name: 'Line Join',
    type: 'string',
    prop: 'wireframeLinejoin',
    default: 'round',
  }]
}

export const sizeAttenuation = {
  name: 'Attenuation',
  type: 'boolean',
  prop: 'sizeAttenuation',
  default: true,
}

export const rotation = {
  name: 'Rotation',
  type: 'radians',
  prop: 'rotation',
  default: 0,
}

export const point = {
  name: 'Points',
  type: 'group',
  props: [{
    name: 'Size',
    type: 'number',
    prop: 'size',
    default: 1,
  }, {
    name: 'Attenuation',
    type: 'boolean',
    prop: 'sizeAttenuation',
    default: true,
  }]
}

export const emissive = {
  name: 'Emissive',
  type: 'group',
  props: [{
    name: 'Color',
    type: 'color',
    prop: 'emissive',
  }, {
    name: 'Emissive Map ',
    type: 'texture',
    prop: 'emissiveMap',
  }, {
    name: 'Emissive Intensity',
    prop: 'emissiveIntensity',
    type: 'number',
    default: 1,
  }]
};
