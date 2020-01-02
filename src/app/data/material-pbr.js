export const metalness = {
  type: 'group',
  name: 'Metalness',
  props: [{
    name: 'Map',
    type: 'texture',
    prop: 'metalnessMap',
  }, {
    name: 'Metalness',
    type: 'number',
    prop: 'metalness',
    min: 0,
    max: 1,
  }],
}

export const roughness = {
  type: 'group',
  name: 'Roughness',
  props: [{
    name: 'Roughness Map',
    type: 'texture',
    prop: 'roughnessMap',
  }, {
    name: 'Roughness',
    type: 'number',
    prop: 'roughness',
    min: 0,
    max: 1,
  }],
};

export const clearCoat = {
  type: 'group',
  name: 'Clear Coat',
  props: [{
    name: 'Clear Coat',
    type: 'number',
    prop: 'clearCoat',
    min: 0,
    max: 1,
    default: 0,
  }, {
    name: 'Clear Coat Roughness',
    type: 'number',
    prop: 'clearCoatRoughness',
    min: 0,
    max: 1,
    default: 0,
  }],
};
