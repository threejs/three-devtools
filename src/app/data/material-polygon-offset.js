export default {
  type: 'group',
  name: 'Polygon Offset',
  props: [{
    name: 'Enabled',
    type: 'boolean',
    prop: 'polygonOffset',
    default: false,
  }, {
    name: 'Offset Factor',
    type: 'int',
    prop: 'polygonOffsetFactor',
    default: 0,
  }, {
    name: 'Offset Units',
    type: 'int',
    prop: 'polygonOffsetUnits',
    default: 0,
  }]
};
