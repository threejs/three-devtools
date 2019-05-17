window.SRC_CONTENT_INDEX = `
const $send = Symbol('send');
const $serializeEntity = Symbol('serializeEntity');
const $serializeScene = Symbol('serializeScene');
const $log = Symbol('log');
const $connected = Symbol('connected');
const $contentReady = Symbol('contentReady');
const $devtoolsReady = Symbol('devtoolsReady');
const $attemptConnection = Symbol('attemptConnection');
const $entityMap = Symbol('entityMap');
const $sceneData = Symbol('sceneData');

//setInterval(() => this.__sendRendererInfo(), 1000);

window.ThreeDevTools = new class ThreeDevTools extends EventTarget {
  constructor() {
    super();

    this.scene = null;
    this.renderer = null;
    this[$connected] = false;
    this[$devtoolsReady] = false;
    this[$contentReady] = false;
    this[$entityMap] = new Map();

    this.selected = window.$t = null;

    this[$send]('load');
  }

  get connected() {
    return this[$connected];
  }

  connect(config = {}) {
    this.renderer = config.renderer || this.renderer;
    this.scene = config.scene || this.scene;
    this[$contentReady] = true;
    this[$send]('connect');
    this[$attemptConnection]();
  }

  /**
   * API for extension, should not be called by content
   */

  /**
   * Called when the devtools first opens or shortly after
   * page load.
   */
  __connect() {
    this[$devtoolsReady] = true;
    this[$attemptConnection]();
  }

  /**
   * This is the active object in the devtools viewer.
   */
  __select(uuid) {
    const selected = this[$entityMap].get(uuid);
    console.log('selected', selected);
    if (selected) {
      this.selected = window.$t = selected;
    }
  }

  __requestRendererInfo() {
    if (this.connected && this.renderer) {
      const info = {
        render: this.renderer.info.render,
        memory: this.renderer.info.memory,
      };
      this[$send]('renderer-info', info);
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

  __requestScene() {
    if (!this.connected || !this.scene) {
      return;
    }
    this[$sceneData] = this[$serializeScene](this.scene);
    this[$entityMap] = new Map();

    // Iterate through scene and tag all entities
    // (objects, materials, textures, etc.) and store
    // it in $entityMap.
    this.scene.traverse(o => {
      this[$entityMap].set(o.uuid, o);
      if (o.material && o.material.uuid) {
        const materials = [].concat(o.material);
        for (let material of materials) {
          this[$entityMap].set(material.uuid, material);
          for (let key of Object.keys(material)) {
            const value = material[key];
            if (value && value.isTexture) {
              this[$entityMap].set(value.uuid, value);
              if (value.image && value.image.uuid) {
                this[$entityMap].set(value.image.uuid, value.image);
              }
            }
          }
        }
      }
      if (o.geometry && o.geometry.uuid) {
        this[$entityMap].set(o.geometry.uuid, o.geometry);
      }
    });

    this[$send]('scene', this[$sceneData]);
  }

  __requestEntity(uuid) {
    if (!this.connected || !uuid || !this.scene) {
      return;
    }
    const entity = this[$entityMap].get(uuid);
    if (entity) {
      const data = this[$serializeEntity](entity);
      this[$send]('entity', data);
    }
  }

  /**
   * Private
   */

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

  [$attemptConnection]() {
    if (!this.connected && this[$contentReady] && this[$devtoolsReady]) {
      this[$connected] = true;
      this.__requestScene();
      this.__requestRendererInfo();

      // @TODO manage this better
      setInterval(() => this.__requestRendererInfo(), 1000);
    }
  }


  /**
   * This turns a Three entity into something serializable.
   * Mostly the built-in 'toJSON()' method with cached metadata.
   */
  [$serializeEntity](entity) {
    const json = entity.toJSON(this[$sceneData]);
    // Attach 'typeHint' here since we lose this information
    // over the wire.
    const typeHint = entity.isObject3D ? 'object' :
                     entity.isMaterial ? 'material' :
                     entity.isTexture ? 'texture' :
                     entity.isImage ? 'image' :
                     entity.isGeometry ? 'geometry' :
                     entity.isBufferGeometry ? 'geometry' :
                     entity.isShape ? 'shape' : 'unknown';

    (json.object || json).typeHint = typeHint;

    return json;
  }

  [$serializeScene](scene) {
    const json = scene.toJSON();
    // The root scene stores the cache of all objects already JSON-ified,
    // so we need to tag these initially.
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
      json.object.typeHint = 'scene';
    }
    return json;
  }

  [$log](...message) {
    console.log('%c ThreeDevTools:', 'color:red', ...message);
  }
};
`;
