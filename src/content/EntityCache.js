export default (() => {

const PATCHED = '__SERIALIZATION_PATCHED__';
const toJSONStub = function(){ return {}; };
const materialMaps = [
  'map', 'alphaMap', 'specularMap', 'envMap', 'lightMap', 'aoMap',
  'displacementMap', 'normalMap', 'bumpMap', 'roughnessMap',
  'metalnessMap', 'emissiveMap'
];

return class EntityCache {
  constructor() {
    this.scenes = new Set();
    this.renderers = [];

    this.entityMap = new Map();
    this.resources = {
      geometries: {}, 
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      scenes: {},
      scanSerialization: false,
    };
  }

  getEntity(id) {
    this.entityMap.get(id);
  }

  /**
   * Adds a renderer or scene to be registered and observed
   * to iterate over in the future when looking for resources.
   * 
   * @param {THREE.Scene | THREE.WebGLRenderer} entity 
   * @return {String} returns the ID of the entity if and only if it was added.
   */
  add(entity) {
    if (!entity || utils.isHiddenFromTools(entity)) {
      //console.error('ThreeDevTools#observe must have event detail.');
      return;
    }

    const id = this.getID(entity);

    if (!id) {
      return;
    }

    this.entityMap.set(id, entity);

    if (entity.isScene) {
      this.scenes.add(entity); 
      this._registerEntity(entity);
    } else if (typeof entity.render !== 'function') {
      throw new Error('May only observe scenes and renderers currently.');
    }

    return id;
  }

  /**
   * Returns the associated resources that have
   * already been discovered of corresponding type.
   */
  getType(type) {
    if (!this.resources[type]) {
      throw new Error('Unknown type');
    }

    if (type === 'images') {
      throw new Error('images not yet supported');
    }

    const results = {};
    // The `meta` object for serialization stores each
    // type as an object, but returns types as an array.
    results[type] = Object.values(this.resources[type]);

    if (type === 'textures') {
      results['images'] = Object.values(this.resources.images);
    }

    //this._postSerialization(results);
    return results;
  }

  get(id) {
    const entity = this.entityMap.get(id);
    if (!entity) {
      return;
    }

    if (/renderer/.test(id)) {
      return {
        type: 'renderer',
        id,
        info: {
          render: entity.info.render,
          memory: entity.info.memory,
        },
      };
    }

    // The observe call for our own internal scene
    // fires as soon as the devtools scene superclass
    // is created, before any signifiers can be added
    // by the inheriting class. Luckily(?) there is a tick
    // after observing an object and when it refreshes.
    // Check here to see if the internal scene should
    // be removed
    if (utils.isHiddenFromTools(entity)) {
      this.entityMap.delete(id);
      return;
    }

    let data;
    let resourceType;

    if (entity.isScene) {
      // If fetching a scene directly, only the object graph
      // is really valuable.
      data = this._serializeEntity(entity, { scan: true });
      resourceType = 'scenes';
    }
    else if (entity.isObject3D) {
      // Can we ignore children? 
      data = this._serializeEntity(entity, { scan: true });
    } else if (entity.isMaterial) {
      data = this._serializeEntity(entity);
      resourceType = 'materials';
    } else if (entity.isGeometry) {
      data = this._serializeEntity(entity);
      resourceType = 'geometries';
    } else if (entity.isBufferGeometry) {
      data = this._serializeEntity(entity);
    } else if (entity.isTexture) {
      // Should be an option to not use cache here
      data = this._serializeEntity(entity);
      resourceType = 'textures';
    } else {
      data = this._serializeEntity(entity);
    }

    // Merge the newly serialized object back into resources.
    if (resourceType) {
      this.resources[resourceType][data.uuid] = data;
    }

    return data;
  }

  /**
   * Updates the entityMap with in any in use entities,
   * and populates `this.resources` with new entities.
   * Does not serialize entities with latest values if
   * they already exist. This should remain fast and light
   * as possible.
   * 
   * Currently this does update the values in `resources.scenes`
   * since those will be generated regardless. In the future
   * handling objects like other resources will be ideal
   * for shallower fetching of objects without all of their
   * children.
   */
  scan(_scene) {
    const scenes = _scene ? [_scene] : this.scenes;
    for (let scene of scenes) {
      this._forEachDependent(scene, d => this._registerEntity(d));
      const object = this._serializeEntity(s, {
        scan: true,
      });
      this.resources.scenes[scene.uuid] = object;
    }
  }

  _forEachDependent(entity, fn, options) {
    if (entity.isObject3D) {
      for (let child of entity.children) {
        fn(child);
        this._forEachDependent(child, fn);
      }

      if (entity.material && entity.material.isMaterial) {
        fn(entity.material);
        this._forEachDependent(entity.material);
      }
      if (entity.geometry && (entity.geometry.isGeometry || entity.geometry.isBufferGeometry)) {
        fn(entity.geometry);
        this._forEachDependent(entity.geometry);
      }
      if (entity.isScene && entity.background) {
        fn(entity.background);
        this._forEachDependent(entity.background, fn);
      }
    }
    else if (entity.isBufferGeometry) {
      // handle attributes
    }
    else if (entity.isMaterial) {
      for (let key of Object.keys(entity)) {
        // @TODO cache textures used as uniforms here as well
        const texture = material[key];
        if (texture && texture.isTexture) {
          fn(texture);
          this._forEachDependent(texture, fn);
        }
      }
      if (entity.uniforms) {
        for (let name of Object.keys(entity.uniforms)) {
          const value = entity.uniforms[name].value;
          if (value && value.isTexture) {
            // What other "dependent" data could a material have?
            // more geometry/buffers?
            fn(value);
            this._forEachDependent(value, fn);
          }
        } 
      }
    }
    else if (entity.isTexture) {
      if (entity.image && entity.image.uuid) {
        // maybe don't cache images as an entity
          //Object.prototype.toString.call(this.image) === '[object Object]';
      }
    }
  }

  /**
   * Patches the `toJSON` method on objects that either:
   * 1) do not have the method
   * 2) returns insufficient information
   * 3) throws an error on serialization
   *
   * /!\ This may destructively modify an entity's toJSON method. /!\
   */
  _patchToJSON(entity) {
    if (!entity[PATCHED]) {
      // If it's an entity of a known serialization
      // failure, handle it here.
      // Parametric geometry cannot be rehydrated
      // without introducing a vector for code injection.
      // For serialization, stringifying is fine,
      // but this geometry is unrehydratable (for good reason,
      // as this would then get access to privileged extension code).
      // https://github.com/mrdoob/three.js/issues/17381
      if (entity.parameters && typeof entity.parameters.func === 'function') {
        const toJSON = entity.toJSON;
        entity.toJSON = function () {
          const data = toJSON.apply(this, arguments);
          data.func = entity.parameters.func ?
                      entity.parameters.func.toString() : '';
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

          // We lose information like "CanvasTexture" upon
          // serialization
          data.textureType = utils.textureToTextureType(this);

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
  }

  /**
   * This turns a Three entity into something serializable.
   * Mostly the built-in 'toJSON()' method with cached metadata.
   */
  _serializeEntity(entity, options={}) {
    let json;
    const meta = this.resources;

    // `scan` mode is used to skip the serialization of heavier
    // objects, like buffers and images.
    // @TODO not yet implemented!
    if (options.scan) {
      // Modify the meta object (this.resources) with a flag,
      // since this is the only object that three propagates through
      // a scene's entities' serialization. Can respond in the patched
      // toJSON calls in _patchToJSON().
      meta.scanSerialization = true;
    }
    try {
      //console.time('toJSON-'+entity.uuid);
      json = entity.toJSON(meta);
      //console.timeEnd('toJSON-'+entity.uuid);
    } catch (e) {
      // If this throws, it could be because of some object not being serializable.
      // @TODO handle this, throw it for now.
      console.error(`${entity.uuid} does not appear to be serializable.`, e);
    }
    meta.scanSerialization = false;

    return json.object || json; 
  }

  /**
   * Add extra data to the serialized output from three.
   * @param {Object} json 
   */
  _postSerialization(json) {
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
      json.object.typeHint = json.object.type === 'Scene' ? 'scene' : 'object';
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
    }
    return json;
  }

  /**
   * Tag an entity to be recorded as a resource, and patch
   * any necessary methods. Only executed once per entity.
   */
  _registerEntity(entity) {
    const { uuid } = entity;
    if (uuid && !this.entityMap.has(uuid)) {
      this._patchToJSON(entity);
      this.entityMap.set(uuid, entity);
    }
  }
  
  getID(entity) {
    // Store any observed renderer so IDs can be synthesized.
    if (typeof entity.render === 'function') {
      let rendererIndex = this.renderers.indexOf(entity);

      if (rendererIndex === -1) {
        rendererIndex = this.renderers.length;
        this.renderers.push(entity);
      }
      return `renderer-${rendererIndex}`;
    } else if (entity.uuid) {
      return entity.uuid;
    }
  }

};
});
