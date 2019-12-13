export default (() => {
const PATCHED = '__SERIALIZATION_PATCHED__';
const toJSONStub = function(){ return {}; };
const materialMaps = [
  'map', 'alphaMap', 'specularMap', 'envMap', 'lightMap', 'aoMap',
  'displacementMap', 'normalMap', 'bumpMap', 'roughnessMap',
  'metalnessMap', 'emissiveMap'
];
const utils = {
  hideObjectFromTools: (object) => {
    object.userData.fromDevtools = true;
  },

  isHiddenFromTools: (object) => {
    return !!(object.userData && object.userData.fromDevtools);
  },

  cacheEntitiesInScene: (scene, map) => {  
    map.set(scene.uuid, scene);

    scene.traverse(o => {
      map.set(o.uuid, o);
      if (o.material && o.material.uuid) {
        const materials = [].concat(o.material);
        for (let material of materials) {
          map.set(material.uuid, material);
          for (let key of Object.keys(material)) {
            const value = material[key];
            if (value && value.isTexture) {
              map.set(value.uuid, value);
              if (value.image && value.image.uuid) {
                map.set(value.image.uuid, value.image);
              }
            }
          }
        }
      }
      if (o.geometry && o.geometry.uuid) {
        map.set(o.geometry.uuid, o.geometry);
      }
    });
  },

  mergeResources(output, ...sceneResources) {
    ['materials', 'images', 'geometries', 'textures'].forEach(prop => {
      for (let resources of sceneResources) {
        if (!Array.isArray(output[prop])) {
          output[prop] = [];
        }
        const newEntities = sceneResources[prop] 
        const savedEntities = output[prop] 
        if (!Array.isArray(newEntities) || !newEntities || !newEntities.length) {
          return output;
        }
        output[prop] = savedEntities.push(...newEntities);
      }

      let uuids = [];
      output[prop] = output[prop].filter(entity => {
        if (uuids.indexOf(entity.uuid) !== -1) {
          return false;
        }
        uuids.push(entity.uuid);
        return true;
      });
    });
  },

  /**
   * Iterates over an entity, and patches a toJSON
   * method on objects that either:
   * 1) do not have the method
   * 2) returns insufficient information
   * 3) throws an error on serialization
   *
   * /!\ This may destructively modify an entity's toJSON method. /!\
   */
  patchUnserializableEntities: (entity) => {
    if (!entity) {
      return;
    }

    if (!entity[PATCHED]) {
      // If it's an entity of a known serialization
      // failure, handle it here.
      // Parametric geometry cannot be rehydrated
      // without introducing a vector for code injection.
      // For serialization, stringifying is fine,
      // but this geometry is unrehydratable (for good reason,
      // as this would then get access to privileged extension code).
      // https://github.com/mrdoob/three.js/issues/17381
      if (entity.isParametricGeometry ||
          entity.isParametricBufferGeometry) {
        const toJSON = entity.toJSON;
        entity.toJSON = function () {
          const data = toJSON.apply(this, arguments);
          data.func = entity.parameters.func ?
                      entity.parametrs.func.toString() : '';
          return data;
        };
        entity[PATCHED] = true;
      }
      else if (entity.isTexture) {
        const toJSON = entity.toJSON;
        entity.toJSON = function () {
          // If `image` is a plain object, probably from DataTexture
          // or a texture from a render target, hide it during serialization
          // so an attempt to turn it into a data URL doesn't throw.
          // Patch for DataTexture.toJSON (https://github.com/mrdoob/three.js/pull/17745)
          let textureData = null;
          if (Object.prototype.toString.call(this.image) === '[object Object]') {
            textureData = this.image;
            this.image = undefined;
          }

          // If render target textures had a reference back to their target,
          // we could attempt to serialize the target into a data URL. TBD.
          const data = toJSON.apply(this, arguments);

          if (textureData) {
            this.image = textureData;
          }

          return data;
        }
        entity[PATCHED] = true;
      }
      // Render targets shouldn't be in the graph directly
      // since their textures must be used instead, but this
      // may still occur in `scene.background`, where an attempt
      // at serialization occurs and breaks on render targets.
      // https://github.com/mrdoob/three.js/pull/16764
      else if (entity.isWebGLRenderTarget) {
        // Would be great to actually serialize out the render target,
        // if given a renderer.
        // https://github.com/mrdoob/three.js/issues/16762
        entity.toJSON = toJSONStub;
        entity[PATCHED] = true;
      }
    } 

    // InterleavedBufferAttributes cannot be serialized,
    // nor are they considered entities in this code,
    // so check buffer geometries everytime since
    // the attribute may change.
    // https://github.com/mrdoob/three.js/pull/17328
    if (entity.isBufferGeometry) {
      for (let key of Object.keys(entity.attributes)) {
        const attr = entity.attributes[key];
        if (attr.isInterleavedBufferAttribute && !attr[PATCHED]) {
          attr.toJSON = function () {
            return {
              count: attr.count,
              itemSize: attr.itemSize,
              offset: attr.offset,
              normalized: attr.normalized,
            };
          };
          attr[PATCHED] = true;
        }
      }
    }

    // Recurse to this entity's children and known
    // serializable properties
    if (entity.children) {
      for (let child of entity.children) {
        utils.patchUnserializableEntities(child);
      }
    }
    if (entity.isMaterial) {
      // Find all textures used by this material
      materialMaps
        .filter(key => entity[key])
        .forEach(key => utils.patchUnserializableEntities(entity[key]));

      if (entity.uniforms) {
        for (let uniformName of Object.keys(entity.uniforms)) {
          const uniform = entity.uniforms[uniformName];
          if (uniform.value && uniform.value.isTexture) {
            utils.patchUnserializableEntities(uniform.value);
          }
        }
      }
    }
    if (entity.isScene && entity.background) {
      utils.patchUnserializableEntities(entity.background);
    }
    if (entity.isMesh) {
      utils.patchUnserializableEntities(entity.material);
      utils.patchUnserializableEntities(entity.geometry);
    }
  },

  /**
   * This turns a Three entity into something serializable.
   * Mostly the built-in 'toJSON()' method with cached metadata.
   */
  serializeEntity: (entity, meta) => {
    let json;

    utils.patchUnserializableEntities(entity);

    try {
      //console.time('toJSON-'+entity.uuid);
      json = meta ? entity.toJSON(meta) : entity.toJSON();
      //console.timeEnd('toJSON-'+entity.uuid);
    } catch (e) {
      // If this throws, it could be because of some object not being serializable.
      // @TODO handle this, throw it for now.
      console.error(entity.uuid + ' does not appear to be serializable.', e);
    }
    // Attach 'typeHint' here since we lose this information
    // over the wire.
    // Or is this redundant with the toJSON metadata?
    const typeHint = entity.isObject3D ? 'object' :
                     entity.isMaterial ? 'material' :
                     entity.isTexture ? 'texture' :
                     entity.isImage ? 'image' :
                     entity.isGeometry ? 'geometry' :
                     entity.isBufferGeometry ? 'geometry' :
                     entity.isShape ? 'shape' : 'unknown';

    if (json.geometries) {
      json.geometries.forEach(geometry => geometry.typeHint = 'geometry');
    }
    if (json.materials) {
      json.materials.forEach(material => material.typeHint = 'material');
    }
    if (json.textures) {
      json.textures.forEach(texture => texture.typeHint = 'texture');
    }
    if (json.images) {
      json.images.forEach(texture => texture.typeHint = 'image');
    }
    if (json.shapes) {
      json.shapes.forEach(texture => texture.typeHint = 'shape');
    }
    if (json.object) {
      json.object.typeHint = meta ? 'object' : 'scene';
      if (json.object.children) {
        let children = [...json.object.children];
        while (children.length) {
          let child = children.shift();
          child.typeHint = 'object';
          if (child.children) {
            children.push(...child.children);
          }
        }
      }
    } else {
      json.typeHint = typeHint;
    }

    return json;
  },
};
return utils;
});
