export default (() => {

const PATCHED = '__SERIALIZATION_PATCHED__';

return class EntityCache extends EventTarget {
  constructor() {
    super();
    this.scenes = new Set();
    this.renderers = [];

    this.entityMap = new Map();
    // Map of uuid to version, if any, of a large
    // value stored in resources, like images and buffers. 
    this.resourcesSent = new Map();

    this.resources = {
      images: {},
      // The following values are custom to devtools
      // resource serializations.
      attributes: {},
      // The resources `meta` object is passed to
      // toJSON methods, and the only way to reliably
      // propagate configuration throughout serialization.
      devtoolsConfig: {},
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

    const id = this._getID(entity);

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

  getSceneGraph(uuid) {
    const graph = {}
    const scene = this.getEntity(uuid);
    const objects = [scene];

    while (objects.length) {
      const object = objects.shift();
      this._registerEntity(object);

      graph[object.uuid] = {
        uuid: object.uuid,
        name: object.name,
        baseType: utils.getBaseType(object),
        children: [],
      };
 
      if (object.parent) {
        graph[object.parent.uuid].children.push(object.uuid);
      }

      if (object.children) {
        objects.push(...object.children);
      }
    }

    return graph;
  }

  /**
   * Returns the associated resources that have
   * already been discovered of corresponding type.
   * 
   * @param {String} type can be "scenes", "geometries", "materials", "textures"
   */
  getOverview(type) {
    const entities = [];
    const entitiesAdded = new Set();

    for (let scene of this.scenes) {
      if (type === 'scenes') {
        addEntity(scene);
      } else {
        utils.forEachDependency(scene, entity => {
          this._registerEntity(entity);
          const valid = type === 'geometries' ? (entity.isGeometry || entity.isBufferGeometry) :
                        type === 'materials' ? entity.isMaterial :
                        type === 'textures' ? entity.isTexture : false;
          if (valid && !entitiesAdded.has(entity.uuid)) {
            addEntity(entity);
          }
        }, {
          recursive: true,
        });
      }
    }

    function addEntity(entity) {
      entities.push({
        name: entity.name,
        uuid: entity.uuid,
        baseType: utils.getBaseType(entity),
      });
      entitiesAdded.add(entity.uuid);
    }

    return entities;
  }

  getRenderingInfo(id) {
    const entity = this.getEntity(id);
    if (!entity || !/renderer/.test(id)) {
      return;
    }

    return {
      type: 'renderer',
      uuid: id,
      info: {
        render: entity.info.render,
        memory: entity.info.memory,
        programs: entity.info.programs.length,
      }
    };
  }

  getSerializedEntity(id) {
    const entity = this.getEntity(id);
    if (!entity) {
      return;
    }

    if (/renderer/.test(id)) {
      const data = InstrumentedToJSON.call(entity);
      data.type = 'renderer';
      data.uuid = id;
      return data;
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

    // Cache attribute and image generation if possible
    const meta =  {
      geometries: [],
      materials: [],
      textures: [],
      shapes: [],
      images: this.resources.images,
      // @TODO Right now, the InstrumentedToJSON doesn't
      // stop the overhead of slicing a large array, like
      // textures do with images that have already been serialized.
      attributes: this.resources.attributes,
      devtoolsConfig: {
        serializeChildren: !entity.isObject3D,
      },
    }

    // Register all dependencies, as they may not have
    // been patched with a custom toJSON yet.
    utils.forEachDependency(entity, dep => {
      this._registerEntity(dep);
    });

    let entitiesAdded = new Set();
    let serializedEntity = this._serializeEntity(entity, meta);

    let entities = [serializedEntity];
    entitiesAdded.add(serializedEntity.uuid);

    this._postSerialization(meta);

    // Accumulate serialized dependencies.
    for (let resourceType of ['geometries', 'materials', 'textures', 'shapes']) {
      for (let resource of Object.values(meta[resourceType])) {
        if (!entitiesAdded.has(resource.uuid)) {
          entities.push(resource);
          entitiesAdded.add(resource.uuid);
        }
      }
    }

    // Only add the stored resources of images and attributes
    // if they haven't been sent over the wire yet
    for (let resourceType of ['images', 'attributes']) {
      const resources = this.resources[resourceType];
      for (let uuid of Object.keys(resources)) {
        if (!this.resourcesSent.has(uuid)) {
          const entity = resources[uuid];
          this.resourcesSent.set(uuid, entity.version);
          entities.push(entity);
        }
      }
    }

    return entities;
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
   * @param {Boolean} options.serializeChildren [true]
   */
  _serializeEntity(entity, meta={}) {
    let json;

    try {
      //console.time('toJSON-'+entity.uuid);
      json = entity.toJSON(meta);
      //console.timeEnd('toJSON-'+entity.uuid);
    } catch (e) {
      // If this throws, it could be because of some object not being serializable.
      // @TODO handle this, throw it for now.
      console.error(`${entity.uuid} does not appear to be serializable.`, e);
    }
    
    return json && json.object ? json.object : json; 
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
  _postSerialization(data) {
    // Moves all Geometry attributes to their own category,
    // like textures do with images, so that they don't
    // clog up the data transfer.
    for (let geo of Object.values(data.geometries)) {
      if (geo.data) {
        const id = `attrs-${geo.uuid}`;
        data.attributes[id] = geo.data;
        delete geo.data;
      }
    }
  }

  _getID(entity) {
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
