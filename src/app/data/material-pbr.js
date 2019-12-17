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
  }],
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

export const clearCoat = {
  type: 'group',
  name: 'Clear Coat',
  props: [{
    name: 'Clear Coat',
    type: 'number',
    prop: 'clearCoat',
    default: 0,
  }, {
    name: 'Clear Coat Roughness',
    type: 'number',
    prop: 'clearCoatRoughness',
    default: 0,
  }],
};

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
