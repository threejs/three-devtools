export default (() => {

const PATCHED = '__SERIALIZATION_PATCHED__';
const SERIALIZATION_DEFAULTS = {
  quickScan: false,
};

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
      // The following values are custom to devtools
      // resource serializations.
      scenes: {},
      attributes: {},
      // The resources `meta` object is passed to
      // toJSON methods, and the only way to reliably
      // propagate configuration throughout serialization.
      devtoolsConfig: Object.assign({}, SERIALIZATION_DEFAULTS),
    };
  }

  getEntity(id) {
    return this.entityMap.get(id);
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

    if (entity.isScene) {
      this.scenes.add(entity); 
      this._registerEntity(entity);
    } else if (typeof entity.render === 'function') {
      this.entityMap.set(id, entity);
    } else {
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

    console.log('resources', this.resources);
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
      data = this._serializeEntity(entity, { quickScan: true });
      resourceType = 'scenes';
    }
    else if (entity.isObject3D) {
      // Can we ignore children? 
      data = this._serializeEntity(entity, { quickScan: true });
    } else if (entity.isMaterial) {
      data = this._serializeEntity(entity);
      resourceType = 'materials';
    } else if (entity.isGeometry) {
      data = this._serializeEntity(entity);
      resourceType = 'geometries';
    } else if (entity.isBufferGeometry) {
      data = this._serializeEntity(entity);
      resourceType = 'geometries';
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

    this._postSerialization();
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
  scan() {
    for (let scene of this.scenes) {
      this._forEachDependent(scene, d => this._registerEntity(d));
      const data = this._serializeEntity(scene, {
        quickScan: true,
      });
      this.resources.scenes[scene.uuid] = data;
    }
    this._postSerialization();
  }

  _forEachDependent(entity, fn, options) {
    if (entity.isObject3D) {
      for (let child of entity.children) {
        fn(child);
        this._forEachDependent(child, fn);
      }

      if (entity.material && entity.material.isMaterial) {
        fn(entity.material);
        this._forEachDependent(entity.material, fn);
      }
      if (entity.geometry && (entity.geometry.isGeometry || entity.geometry.isBufferGeometry)) {
        fn(entity.geometry);
        this._forEachDependent(entity.geometry, fn);
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
        const texture = entity[key];
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
    // Patch BufferGeometry's InterleavedBufferAttributes
    // since it does not have its own toJSON method.
    // Attributes can be added and removed as well,
    // so check everytime.
    // Note that attribute's `toJSON` does *not*
    // receive the meta resource object so it's not
    // possible to customize with config.
    // https://github.com/mrdoob/three.js/pull/17328
    if (entity.isBufferGeometry) {
      for (let key of Object.keys(entity.attributes)) {
        const attr = entity.attributes[key];
        if (attr.isInterleavedBufferAttribute) {
          this._patchToJSON(attr);
        }
      }
    }

    if (!entity[PATCHED]) {
      // via `src/content/toJSON.js`
      entity.toJSON = InstrumentedToJSON; 
      entity[PATCHED] = true;
    }
  }

  /**
   * This turns a Three entity into something serializable.
   * Mostly the built-in 'toJSON()' method with cached metadata.
   * 
   * @param {*} entity
   * @param {Object} options
   * @param {Boolean} options.quickScan
   */
  _serializeEntity(entity, options={}) {
    let json;
    const meta = this.resources;

    // Modify the meta object (this.resources) with flags,
    // since this is the only object that three propagates through
    // a scene's entities' serialization. Can respond in the patched
    // toJSON calls.
    meta.devtoolsConfig = Object.assign({}, SERIALIZATION_DEFAULTS, options || {});

    try {
      //console.time('toJSON-'+entity.uuid);
      json = entity.toJSON(meta);
      //console.timeEnd('toJSON-'+entity.uuid);
    } catch (e) {
      // If this throws, it could be because of some object not being serializable.
      // @TODO handle this, throw it for now.
      console.error(`${entity.uuid} does not appear to be serializable.`, e);
    }
    
    return json.object || json; 
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

  /**
   * Run after collecting resources. Ensure that this
   * is executed after merging a newly serialized object
   * back into the resources.
   */
  _postSerialization() {
    // Moves all Geometry attributes to their own category,
    // like textures do with images, so that they don't
    // clog up the data transfer.
    for (let geo of Object.values(this.resources.geometries)) {
      if (geo.data) {
        const id = `attrs-${geo.uuid}`;
        this.resources.attributes[id] = geo.data;
        delete geo.data;
      }
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
