
export const objectTypeToCategory = type => {
  switch (type) {
    case 'Mesh':
      return 'mesh';
    case 'Line':
    case 'LineLoop':
    case 'LineSegments':
      return 'line';
    case 'AmbientLight':
    case 'DirectionalLight':
    case 'HemisphereLight':
    case 'PointLight':
    case 'RectAreaLight':
    case 'SpotLight':
      return 'light';
    case 'ArrowHelper':
    case 'AxesHelper':
    case 'BoxHelper':
    case 'Box3Helper':
    case 'CameraHelper':
    case 'DirectionalLightHelper':
    case 'FaceNormalsHelper':
    case 'GridHelper':
    case 'PolarGridHelper':
    case 'PositionalAudioHelper':
    case 'HemisphereLightHelper':
    case 'PlaneHelper':
    case 'PointLightHelper':
    case 'RectAreaLightHelper':
    case 'SkeletonHelper':
    case 'SpotLightHelper':
    case 'VertexNormalsHelper':
      return 'helper';
    case 'Skeleton':
    case 'Bone':
      return 'bone';
    case 'Group':
      return 'group';
    default:
      return /light/i.test(type) ? 'light' :
             /mesh/i.test(type) ? 'mesh' :
             /bone/i.test(type) ? 'bone' :
             /line/i.test(type) ? 'line' :
             /group/i.test(type) ? 'group' :
             /helper/i.test(type) ? 'helper' : 'unknown';
  }
}

// These color conversions should be way more robust..
// @TODO use THREE.Color
export const hexNumberToCSSString = hex =>
  `#${("000000" + (hex).toString(16)).slice(-6)}`;

export const cssStringToHexNumber = string => +`0x${string.substr(1)}`;

/**
 * Operates on a serialized THREE object,
 * recursively searching through the objects for a
 * matching UUID.
 */
export const getObjectByUUID = (obj, uuid) => {
  if (obj.uuid === uuid) {
    return obj;
  } else if (obj.children && obj.children.length) {
    for (let child of obj.children) {
      let result = getObjectByUUID(child, uuid);
      if (result) {
        return result;
      }
    }
  } else {
    return null;
  }
};
