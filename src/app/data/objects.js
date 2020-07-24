import transform from './object-transform.js';
import renderable from './object-renderable.js';

const geometry = {
  name: 'Geometry',
  prop: 'geometry',
  type: 'geometry',
}
const material = {
  name: 'Material',
  prop: 'material',
  type: 'material',
}

const object = [
  transform,
  renderable,
];

const GeometryRenderable = {
  type: 'object',
  props: [
    geometry,
    material,
    transform,
    renderable,
  ]
}

const Scene = {
  type: 'scene',
  props: object,
}

const Helper = {
  type: 'helper',
  props: object,
}

const Bone = {
  type: 'bone',
  props: object,
}

// Does not have a further classification yet
const Object3D = {
  type: 'object',
  props: object,
}

export default {
  Mesh: GeometryRenderable,
  Line: GeometryRenderable,
  LineLoop: GeometryRenderable,
  LineSegments: GeometryRenderable,
  Points: GeometryRenderable,
  SkinnedMesh: GeometryRenderable,
  InstancedMesh: GeometryRenderable,

  AxesHelper: Helper,
  BoxHelper: Helper,
  Box3Helper: Helper,
  CameraHelper: Helper,
  DirectionalLightHelper: Helper,
  FaceNormalsHelper: Helper,
  GridHelper: Helper,
  PolarGridHelper: Helper,
  PositionalAudioHelper: Helper,
  HemisphereLightHelper: Helper,
  PlaneHelper: Helper,
  PointLightHelper: Helper,
  RectAreaLightHelper: Helper,
  SkeletonHelper: Helper,
  SpotLightHelper: Helper,
  VertexNormalsHelper: Helper,

  Scene: Scene,
 
  Skeleton: Bone,
  Bone: Bone,

  Object3D: Object3D,
  Group: Object3D,
  PerspectiveCamera: Object3D,
  OrthographicCamera: Object3D,
  Camera: Object3D,
};
