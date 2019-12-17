export default {
  name: 'Blending',
  type: 'group',
  props: [{
    name: 'Blending',
    prop: 'blending',
    type: 'enum',
  }, {
    name: 'Alpha Test',
    prop: 'alphaTest',
    type: 'number',
    default: 0,
  }, {
    name: 'Source',
    prop: 'blendSrc',
    type: 'enum',
  }, {
    name: 'Source Alpha',
    prop: 'blendSrcAlpha',
    type: 'number',
    default: 0,
  }, {
    name: 'Destination',
    prop: 'blendDst',
    type: 'enum',
  }, {
    name: 'Destination Alpha',
    prop: 'blendDstAlpha',
    type: 'number',
    default: 0,
  }, {
    name: 'Blend Equation',
    prop: 'blendEquation',
    type: 'enum',
  }, {
    name: 'Blend Equation Alpha',
    prop: 'blendEquationAlpha',
    type: 'number',
    default: 0,
  }, {
    name: 'Premultiplied Alpha',
    prop: 'premultipliedAlpha',
    type: 'number',
    default: 0,
  }],
};
