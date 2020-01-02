export default {
  name: 'Rendering',
  type: 'group',
  props: [{
    name: 'Render Order',
    prop: 'renderOrder',
    type: 'int',
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
  }],
}
