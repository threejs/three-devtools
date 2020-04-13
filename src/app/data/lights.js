import transform from './object-transform.js';
import renderable from './object-renderable.js';

const base = [{
  name: 'Color',
  prop: 'color',
  type: 'color',
}, {
  name: 'Intensity',
  prop: 'intensity',
  type: 'number',
}];

const objectProps = [
  transform,
  renderable,
];

const castShadow = {
  name: 'Cast Shadow',
  prop: 'castShadow',
  type: 'boolean',
  default: false,
};

const target = {
  name: 'Target',
  prop: 'target',
  type: 'vec3',
};
      
const decay = {
  name: 'Decay',
  prop: 'decay',
  type: 'number',
  default: 1,
};
const distance = {
  name: 'Distance',
  prop: 'distance',
  type: 'number',
  default: 0,
};
const power = {
  name: 'Power',
  prop: 'power',
  type: 'number',
  default: Math.PI * 4,
};

const Light = {
  type: 'light',
  props: [
    ...base,
    ...objectProps
  ],
}

export default {
  Light: Light,
  AmbientLight: Light,
  DirectionalLight: {
    type: 'object',
    props: [
      ...base,
      castShadow,
      target,
      ...objectProps,
    ],
  },
  HemisphereLight: {
    type: 'object',
    props: [
      ...base,
      castShadow,
      {
        name: 'Ground Color',
        prop: 'groundColor',
        type: 'color'
      },
      ...objectProps,
    ],
  },
  PointLight: {
    type: 'object',
    props: [
      ...base,
      castShadow,
      decay,
      distance,
      power,
      ...objectProps,
    ],
  },
  RectAreaLight: {
    type: 'object',
    props: [
      ...base,
      castShadow,
      {
        name: 'Width',
        prop: 'width',
        type: 'number'
      }, {
        name: 'Height',
        prop: 'height',
        type: 'number'
      },
      ...objectProps,
    ],	  
  },
  SpotLight: {
    type: 'object',
    props: [
      ...base,
      castShadow,
      {
        name: 'Angle',
        prop: 'angle',
        type: 'angle',
        default: Math.PI/3,
        min: 0,
        max: Math.PI/2,
      },
      decay,
      distance,
      power,
      {
        name: 'Penumbra',
        prop: 'penumbra',
        type: 'number',
        default: 0,
        min: 0,
        max: 1,
      },
      target,
      ...objectProps,
    ],
  },
};
