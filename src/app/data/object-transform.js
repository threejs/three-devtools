export default {
  name: 'Transform',
  type: 'group',
  props: [{
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
  }]
}