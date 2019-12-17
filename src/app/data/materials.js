import common from './material-common.js';
import * as prop from './material-shared.js';
import blending from './material-blending.js';
import polygonOffset from './material-polygon-offset.js';
import { line, lineDashed } from './material-line.js';
import { metalness, roughness, clearCoat, bumpMap, normalMap } from './material-pbr.js';

const standard = [
  {
    name: 'Environment',
    type: 'group',
    props: [prop.envMap, prop.envMapIntensity].map(p => {
      p.name = p.name.replace(/Environment /, '');
      return p;
    }),
  },
  metalness,
  roughness,
  bumpMap,
  normalMap,
  prop.displacement, 
  prop.ao, 
  prop.lightMap, 
];

const base = [
  common,
  blending,
  polygonOffset
];

const GenericMaterial = {
  type: 'material',
  props: base,
}

export default {
  Material: GenericMaterial,
  MeshBasicMaterial: {
    type: 'material',
    props: [
      prop.color,
      prop.diffuseMap,
      prop.alphaMap,
      prop.combine,
      prop.envMap,
      prop.reflectivity,
      prop.refractionRatio,
      prop.morphTargets,
      prop.specularMap,
      prop.skinning,
      prop.wireframe,
      prop.ao, 
      prop.lightMap, 
      ...base
    ],
  },
  MeshDepthMaterial: {
    type: 'material',
    props: [
      prop.depthPacking,
      prop.diffuseMap,
      prop.alphaMap,
      prop.wireframe,
      prop.displacement,
      ...base
    ],
  },
  MeshDistanceMaterial: {
    type: 'material',
    props: [
      prop.displacement,
      ...base
    ],
  },
  MeshLambertMaterial: {
    type: 'material',
    props: [
      prop.color,
      prop.diffuseMap,
      prop.alphaMap,
      prop.envMap,
      prop.reflectivity,
      prop.refractionRatio,
      prop.morphNormals,
      prop.morphTargets,
      prop.specularMap,
      prop.skinning,
      prop.wireframe,
      prop.emissive,
      prop.ao, 
      prop.lightMap, 
      ...base
    ],
  },
  MeshMatcapMaterial: GenericMaterial,
  MeshNormalMaterial: GenericMaterial,
  MeshPhongMaterial: GenericMaterial,
  MeshPhysicalMaterial: {
    type: 'material',
    props: [
      prop.diffuseMap,
      prop.color,
      prop.refractionRatio,
      prop.reflectivity,
      prop.skinning,
      prop.wireframe,
      ...standard,
      clearCoat,
      prop.emissive,
      ...base
    ],
  },
  MeshStandardMaterial: {
    type: 'material',
    props: [
      prop.diffuseMap,
      prop.color,
      prop.refractionRatio,
      prop.skinning,
      prop.wireframe,
      ...standard,
      ...base
    ],
  },
  MeshToonMaterial: {
    type: 'material',
    props: [
      prop.color,
      prop.gradientMap,
      ...base
    ],
  },
  PointsMaterial: GenericMaterial,
  RawShaderMaterial: GenericMaterial,
  ShaderMaterial: GenericMaterial,
  ShadowMaterial: GenericMaterial,
  SpriteMaterial: GenericMaterial,
  LineBasicMaterial: {
    type: 'material',
    props: [
      prop.color,
      line,
      ...base
    ],
  },
  LineDashedMaterial: {
    type: 'material',
    props: [
      prop.color,
      line,
      lineDashed,
      ...base
    ],
  },
};
