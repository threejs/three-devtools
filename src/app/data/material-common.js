export default {
  name: 'Properties',
  type: 'group',
  props: [{
    name: 'Side',
    prop: 'side',
    type: 'enum',
    default: 0,
  }, {
    name: 'Transparent',
    prop: 'transparent',
    type: 'boolean',
    default: false,
  }, {
    name: 'Visible',
    prop: 'visible',
    type: 'boolean',
    default: true,
  }, {
    name: 'Opacity',
    prop: 'opacity',
    type: 'number',
    min: 0,
    max: 1,
    default: 1,
  }, {
    name: 'Color Write',
    prop: 'colorWrite',
    type: 'boolean',
    default: true,
  }, {
    name: 'Depth Func',
    prop: 'depthFunc',
    type: 'enum',
  }, {
    name: 'Depth Test',
    prop: 'depthTest',
    type: 'boolean',
    default: true,
  }, {
    name: 'Depth Write',
    prop: 'depthWrite',
    type: 'boolean',
    default: true,
  }, {
    name: 'Lights',
    prop: 'lights',
    type: 'boolean',
    default: false,
  }, {
    name: 'Flat Shading',
    prop: 'flatShading',
    type: 'boolean',
    default: false,
  }, {
    name: 'Fog',
    prop: 'fog',
    type: 'boolean',
    default: false,
  }, {
    name: 'Dithering',
    prop: 'dithering',
    type: 'boolean',
    default: false,
  }, {
    name: 'Clip Intersection',
    prop: 'clipIntersection',
    type: 'boolean',
    default: false,
  }, {
    name: 'Clip Shadows',
    prop: 'clipShadows',
    type: 'boolean',
    default: false,
  }, {
    name: 'Shadow Side',
    prop: 'shadowSide',
    type: 'enum',
    default: 0,
  }, {
    name: 'Tone Mapped',
    prop: 'toneMapped',
    type: 'boolean',
    default: true,
  }, {
    name: 'Vertex Colors',
    prop: 'vertexColors',
    type: 'enum',
  }, {
    name: 'Vertex Tangents',
    prop: 'vertexTangents',
    type: 'boolean',
    default: false,
  }]
}
