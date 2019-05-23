window.SRC_CONTENT_INDEX = `
(function() {
const $send = Symbol('send');
const $log = Symbol('log');
const $connected = Symbol('connected');
const $contentConnected = Symbol('contentConnected');
const $devtoolsConnected = Symbol('devtoolsConnected');
const $attemptConnection = Symbol('attemptConnection');
const $entityMap = Symbol('entityMap');
const $resources = Symbol('sceneData');
const $initializeContent = Symbol('initializeContent');
const $registerScene = Symbol('registerScene');
const $registerRenderer = Symbol('registerRenderer');
const DEBUG = false;

const utils = {
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
   * This turns a Three entity into something serializable.
   * Mostly the built-in 'toJSON()' method with cached metadata.
   */
  serializeEntity: (entity, meta) => {
    console.time('toJSON-'+entity.uuid);
    const json = meta ? entity.toJSON(meta) : entity.toJSON();
    console.timeEnd('toJSON-'+entity.uuid);
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
}

window.ThreeDevTools = new class ThreeDevTools extends EventTarget {
  constructor() {
    super();

    this.scenes = [];
    this.renderers = [];

    this[$connected] = false;
    this[$devtoolsConnected] = false;
    this[$contentConnected] = false;
    this[$entityMap] = new Map();
    this[$resources] = new Map();

    this.selected = window.$t = null;

    this[$send]('load');
  }

  get connected() {
    return this[$connected];
  }

  addScene(scene) {
    this.scenes.push(scene);
    this[$registerScene](scene);
    this[$initializeContent]();
  }

  addRenderer(renderer) {
    this.renderers.push(renderer);
    this[$registerRenderer](renderer);
    this[$initializeContent]();
  }

  /**
   * API for extension, should not be called by content
   */

  /**
   * Called when the devtools first opens or shortly after
   * page load.
   */
  __connect() {
    this[$devtoolsConnected] = true;
    this[$attemptConnection]();
  }

  /**
   * This is the active object in the devtools viewer.
   */
  __select(uuid) {
    const selected = this[$entityMap].get(uuid);
    if (selected) {
      this.selected = window.$t = selected;
    }
  }

  __updateProperty(uuid, property, value, dataType) {
    this[$log]('__updateProperty(' + Array.prototype.join.call(arguments,',') + ')');
    const item = this[$entityMap].get(uuid);
    if (item) {
      switch (dataType) {
        case 'color':
          if (item[property] && item[property].isColor) {
            item[property].setHex(value);
          } else if (this.THREE) {
            // TODO is there a better way doing this?
            // We can require devs to provide a THREE object,
            // or we can side load our own instance of things like
            // Color.
            item[property] = {
              isColor: true,
              r: (value >> 16 & 255) / 255,
              g: (value >> 8 & 255) / 255,
              b: (value & 255) / 255,
            };
          }
          break;
        default:
          console.log('unknown dataType', dataType);
          item[property] = value;
      }
    }
  }

  __requestEntity(uuid) {
    if (!this.connected || !uuid) {
      return;
    }

    const entity = this[$entityMap].get(uuid);
    if (!entity) {
      return;
    }

    let data;

    if (entity.isScene) {
      data = utils.serializeEntity(entity);

      // Track all resources in all scenes so we can use
      // this object as a cache when serializing other entities.
      utils.mergeResources(this[$resources], data);
      
      // Iterate through scene and tag all entities
      // (objects, materials, textures, etc.) and store
      // it in $entityMap.
      utils.cacheEntitiesInScene(entity, this[$entityMap]);
    } else {
      // Hardcoded to use all scenes metadata for now.
      data = utils.serializeEntity(entity, this[$resources]);
    }

    this[$send]('entity', data);
  }
  
  __requestRenderer(index) {
    const renderer = this.renderers[+index];
    if (this.connected && renderer) {
      const data = {
        id: index+'',
        info: {
          render: renderer.info.render,
          memory: renderer.info.memory,
        },
      };
      this[$send]('renderer', data);
    }
  }


  /**
   * Private
   */
  [$initializeContent]() {
    if (!this[$contentConnected]) {
      this[$contentConnected] = true;
      this[$send]('connect');
      this[$attemptConnection]();
    }
  }

  [$attemptConnection]() {
    if (!this.connected && this[$contentConnected] && this[$devtoolsConnected]) {
      this[$connected] = true;

      // Both content and devtools have indicated intent in debugging.
      // Now to do the initial, costly overhead of parsing any previously
      // registered entities.
      this.scenes.forEach(scene => this[$registerScene](scene));
      this.renderers.forEach(renderer => this[$registerRenderer](renderer));
    }
  }
  
  [$registerScene](scene) {
    if (!this.connected) {
      return;
    }

    this[$entityMap].set(scene.uuid, scene);

    // @TODO can this be rolled into the below?
    this.__requestEntity(scene.uuid);
  }

  [$registerRenderer](renderer) {
    if (!this.connected) {
      return;
    }

    const id = this.renderers.indexOf(renderer);
    // @TODO can this be rolled into the below?
    this.__requestRenderer(id);
  }

  
  [$send](type, data) {
    this[$log]('emitting', type);
    try{
      window.postMessage({
        id: 'three-devtools',
        type: type,
        data,
      }, '*');
    } catch(e) {
      if (!data) {
        throw e;
      }
      // If this throws, it could be because of user data not being
      // able to be cloned. This will be much slower, but it will work.
      console.error('Data could not be cloned; ensure "userData" is serializable.', e);
      window.postMessage({
        id: 'three-devtools',
        type,
        data: JSON.parse(JSON.stringify(data))
      });
    }
  }


  [$log](...message) {
    if (DEBUG) {
      console.log('%c ThreeDevTools:', 'color:red', ...message);
    }
  }
};
})();
`;
