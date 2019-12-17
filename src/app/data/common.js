export const object = [{
  name: 'Position',
  prop: 'position',
  type: 'vec3',
}, {
  name: 'Rotation',
  prop: 'rotation',
  type: 'vec3',
}, {
  name: 'Scale',
  prop: 'scale',
  type: 'vec3',
}, {
  name: 'Matrix Auto Update',
  prop: 'matrixAutoUpdate',
  type: 'boolean',
  default: true,
}, {
  name: 'Rendering',
  type: 'group',
  props: [{
    name: 'Render Order',
    prop: 'renderOrder',
    type: 'number',
    default: 0,
  }, {
    name: 'Visible',
    prop: 'visible',
    type: 'boolean',
    default: true,
  }, {
    name: 'Receive Shadow',
    prop: 'receiveShadow',
    type: 'boolean',
    default: false,
  },{
    name: 'Cast Shadow',
    prop: 'castShadow',
    type: 'boolean',
    default: false,
  },{
    name: 'Frustum Culled',
    prop: 'frustumCulled',
    type: 'boolean',
    default: true,
  },{
    name: 'Draw Mode',
    prop: 'drawMode',
    type: 'number',
    default: 0,
  }],
}];
