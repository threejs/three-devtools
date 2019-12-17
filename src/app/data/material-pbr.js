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