import common from './material-common.js';
import * as prop from './material-shared.js';
import blending from './material-blending.js';
import polygonOffset from './material-polygon-offset.js';
import { line, lineDashed } from './material-line.js';
import { metalness, roughness, clearCoat } from './material-pbr.js';

const standard = [
  {
    name: 'Environment',
    type: 'group',
    props: [prop.envMap, prop.envMapIntensity].map(p => {
      return Object.assign({}, p, {
        name: p.name.replace(/Environment /, ''),
      });
    }),
  },
  metalness,
  roughness,
  prop.normalMap,
  prop.bumpMap,
  prop.displacement, 
  prop.ao, 
  prop.lightMap, 
  prop.emissive,
];

const base = [
  common,
  blending,
  polygonOffset
];

const lineBase = [
  // Remove 'side', 'shadowSide' from line materials
  Object.assign({}, common, {
    props: [...common.props.filter(({ prop }) => ['side', 'shadowSide'].indexOf(prop) === -1)],
  }),
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
      prop.combine,
      prop.alphaMap,
      prop.envMap,
      prop.reflectivity,
      prop.refractionRatio,
      prop.specularMap,
      prop.morphTargets,
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
      prop.diffuseMap,
      prop.alphaMap,
      prop.morphTargets,
      prop.skinning,
      prop.distance,
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
      prop.skinning,
      prop.specularMap,
      prop.wireframe,
      prop.emissive,
      prop.ao, 
      prop.lightMap, 
      ...base
    ],
  },
  MeshMatcapMaterial: {
    type: 'material',
    props: [
      prop.color,
      prop.matcap,
      prop.diffuseMap,
      prop.alphaMap,
      prop.morphNormals,
      prop.morphTargets,
      prop.skinning,
      prop.normalMap,
      prop.bumpMap,
      prop.displacement,
      ...base
    ],
  },
  MeshNormalMaterial: {
    type: 'material',
    props: [
      prop.morphNormals,
      prop.morphTargets,
      prop.skinning,
      prop.wireframe,
      prop.normalMap,
      prop.bumpMap,
      prop.displacement,
      ...base
    ],
  },
  MeshPhongMaterial: {
    type: 'material',
    props: [
      prop.color,
      prop.alphaMap,
      prop.envMap,
      prop.diffuseMap,
      prop.combine,
      prop.refractionRatio,
      prop.reflectivity,
      prop.morphNormals,
      prop.morphTargets,
      prop.skinning,
      prop.ao,
      prop.specular,
      prop.lightMap,
      prop.wireframe,
      prop.emissive,
      prop.normalMap,
      prop.bumpMap,
      prop.displacement,
      ...base
    ],
  },
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
      prop.diffuseMap,
      prop.combine,
      prop.gradientMap,
      prop.alphaMap,
      prop.refractionRatio,
      prop.reflectivity,
      prop.envMap,
      prop.morphNormals,
      prop.morphTargets,
      prop.skinning,
      prop.specular,
      prop.ao,
      prop.lightMap,
      prop.wireframe,
      prop.emissive,
      prop.normalMap,
      prop.bumpMap,
      prop.displacement,
      ...base
    ],
  },
  PointsMaterial: {
    type: 'material',
    props: [
      prop.color,
      prop.alphaMap,
      prop.diffuseMap,
      prop.morphTargets,
      prop.point,
      ...base
    ]
  },
  RawShaderMaterial: {
    type: 'material',
    props: [
      prop.clipping,
      prop.morphNormals,
      prop.morphTargets,
      prop.skinning,
      prop.wireframe,
      ...base
    ],
  },
  ShaderMaterial: {
    type: 'material',
    props: [
      prop.clipping,
      prop.morphNormals,
      prop.morphTargets,
      prop.skinning,
      prop.wireframe,
      ...base
    ],
  },
  ShadowMaterial: GenericMaterial,
  SpriteMaterial: {
    type: 'material',
    props: [
      prop.color,
      prop.diffuseMap,
      prop.rotation,
      prop.sizeAttenuation,
      ...base
    ],
  },
  LineBasicMaterial: {
    type: 'material',
    props: [
      prop.color,
      line,
      ...lineBase
    ],
  },
  LineDashedMaterial: {
    type: 'material',
    props: [
      prop.color,
      line,
      ...lineDashed,
      ...lineBase
    ],
  },
};
