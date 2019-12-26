export default (() => {

const isQuickScan = meta =>
  !!(meta && meta.devtoolsConfig && meta.devtoolsConfig.quickScan);
  
return function InstrumentedToJSON (meta) {
/**
 * The instrumented version of entity's `toJSON` method,
 * used to patch because:
 * 1) entity does not have toJSON method
 * 2) current serialization returns insufficient information
 * 3) throws an error on serialization
 *
 * Additionally, this makes it possible to create
 * instrumentation-only options that can be attached
 * to the `meta` object, like smarter serialization of images.
 */

  // Store our custom flags that are passed in via
  // the resources.
  const quickScan = isQuickScan(meta);

  // First, discover the `baseType`, which for most
  // entities in three.js core, this is the same as
  // `type` -- however the `type` property can be modified
  // by a developer, especially common when extending a
  // base class.
  // Note, be sure to check subclasses before
  // base classes here.
  const baseType = // objects
                   this.isScene ? 'Scene' :
                   this.isGroup ? 'Group' :
                   this.isLOD ? 'LOD' :
                   this.isBone ? 'Bone' :
                   this.isSkeleton ? 'Skeleton' :
                   this.isPoints ? 'Points' :
                   this.isSprite ? 'Sprite' :

                   this.isSkinnedMesh ? 'SkinnedMesh' :
                   this.isInstancedMesh ? 'InstancedMesh' :
                   this.isMesh ? 'Mesh' :

                   this.isLineLoop ? 'LineLoop' :
                   this.isLineSegments ? 'LineSegments' :
                   this.isLine ? 'Line' :

                   this.isObject3D ? 'Object3D' :

                   // geometries only have `type` property containing
                   // a reference to its type if a preset like Sphere or Plane.
                   this.isGeometry ? 'Geometry' :
                   //@TODO what is DirectGeometry? this.isDirectGeometry ? 'DirectGeometry' :
                   this.isInstancedBufferGeometry ? 'InstancedBufferGeometry' :
                   this.isBufferGeometry ? 'BufferGeometry' :
                   // buffer attributes
                   this.isInstancedBufferAttribute ? 'InstancedBufferAttribute' :
                   this.isInterleavedBufferAttribute ? 'InterleavedBufferAttribute' :
                   this.isBufferAttribute ? 'BufferAttribute' :

                   // materials
                   this.isLineBasicMaterial ? 'LineBasicMaterial' :
                   this.isLineDashedMaterial ? 'LineDashedMaterial' :
                   this.isMeshBasicMaterial ? 'MeshBasicMaterial' :
                   this.isMeshDepthMaterial ? 'MeshDepthMaterial' :
                   this.isMeshDistanceMaterial ? 'MeshDistanceMaterial' :
                   this.isMeshLambertMaterial ? 'MeshLambertMaterial' :
                   this.isMeshMatcapMaterial ? 'MeshMatcapMaterial' :
                   this.isMeshNormalMaterial ? 'MeshNormalMaterial' :
                   this.isMeshPhongMaterial ? 'MeshPhongMaterial' :
                   this.isMeshToonMaterial ? 'MeshToonMaterial' :
                   this.isPointsMaterial ? 'PointsMaterial' :
                   this.isShadowMaterial ? 'ShadowMaterial' :
                   this.isSpriteMaterial ? 'SpriteMaterial' :

                   this.isMeshPhysicalMaterial ? 'MeshPhysicalMaterial' :
                   this.isMeshStandardMaterial ? 'MeshStandardMaterial' :

                   this.isRawShaderMaterial ? 'RawShaderMaterial' :
                   this.isShaderMaterial ? 'ShaderMaterial' :

                   this.isMaterial ? 'Material' :

                   // textures 
                   this.isCanvasTexture ? 'CanvasTexture' :
                   this.isCompressedTexture ? 'CompressedTexture' :
                   this.isCubeTexture ? 'CubeTexture' :
                   this.isDataTexture2DArray ? 'DataTexture2DArray' :
                   this.isDataTexture3D ? 'DataTexture3D' :
                   this.isDataTexture ? 'DataTexture' :
                   this.isDepthTexture ? 'DepthTexture' :
                   this.isVideoTexture ? 'VideoTexture' :
                   this.isTexture ? 'Texture' :

                   // Not yet supported fully, but tag it accordingly
                   this.isWebGLRenderTarget ? 'WebGLRenderTarget' :
                   // If nothing matches...
                   'Unknown';

  let textureData;
  if (/Texture/.test(baseType)) {
    // If `image` is a plain object, probably from DataTexture
    // or a texture from a render target, hide it during serialization
    // so an attempt to turn it into a data URL doesn't throw.
    // Patch for DataTexture.toJSON (https://github.com/mrdoob/three.js/pull/17745)
    if (Object.prototype.toString.call(this.image) === '[object Object]') {
      textureData = this.image;
      this.image = undefined;
    }
  }
  
  // Call the original serialization method.
  // Note that this can fail if the toJSON was manually
  // overwritten e.g. not a part of a prototype. Check for its existence
  // first since some do not have any toJSON method,
  // like WebGLRenderTarget
  const toJSON = this.constructor &&
                 this.constructor.prototype &&
                 this.constructor.prototype.toJSON;
  let data = toJSON ? toJSON.apply(this, arguments) : {};

  // If an image was hidden to avoid serialization,
  // reapply it here
  if (textureData) {
    this.image = textureData;
  }
  // Parametric geometry cannot be rehydrated
  // without introducing a vector for code injection.
  // For serialization, stringifying is fine,
  // but this geometry is unrehydratable (for good reason,
  // as this would then get access to privileged extension code).
  // https://github.com/mrdoob/three.js/issues/17381
  else if (data.func) {
    data.func = this.parameters.func ?
                this.parameters.func.toString() : '';
  }
  // Render targets shouldn't be in the graph directly
  // since their textures must be used instead, but this
  // may still occur in `scene.background`, where an attempt
  // at serialization occurs and breaks on render targets.
  // https://github.com/mrdoob/three.js/pull/16764
  else if (this.isWebGLRenderTarget) {
    // Would be great to actually serialize out the render target,
    // if given a renderer.
    // https://github.com/mrdoob/three.js/issues/16762
  }
  // InterleavedBufferAttributes cannot be serialized,
  // so once patched, this will return some very basic
  // data.
  else if (this.isInterleavedBufferAttribute) {
    data.count = this.count;
    data.itemSize = this.itemSize;
    data.offset = this.offset;
    data.normalized = this.normalized;
  }

  if (data.object) {
    data.object.baseType = baseType;
  } else {
    data.baseType = baseType;
  }

  return data;
}
});
