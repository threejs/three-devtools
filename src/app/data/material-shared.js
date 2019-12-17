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
  type: 'boolean',
};

export const alphaMap = {
  name: 'Alpha Map',
  prop: 'alphaMap',
  type: 'texture',
};

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
    default: 1,
  }, {
    name: 'Bias',
    type: 'number',
    prop: 'displacementBias',
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
  type: 'texture',
  prop: 'envMapIntensity',
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
}

export const reflectivity = {
  name: 'Reflectivity',
  type: 'number',
  prop: 'reflectivity',
  default: 1,
}

export const refractionRatio = {
  name: 'Refraction Ratio',
  type: 'number',
  prop: 'refractionRatio',
  default: 0.98,
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

export const wireframe = {
  name: 'Wireframe',
  type: 'boolean',
  prop: 'wireframe',
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
    type: 'number',
    prop: 'emissiveIntensity',
  }]
};
