(() => {
const DEBUG = false;
const utils = window.__THREE_DEVTOOLS_UTILS__;
const EventDispatcher = window.__THREE_DEVTOOLS_EVENT_DISPATCHER__;
const $send = Symbol('send');
const $log = Symbol('log');
const $entityMap = Symbol('entityMap');
const $resources = Symbol('resources');
const $addScene = Symbol('addScene');
const $addRenderer = Symbol('addRenderer');

/**
 * Supported events:
 *
 * `scene`
 * `renderer`
 */
window.__THREE_DEVTOOLS__ = new class ThreeDevTools extends EventDispatcher {
  constructor() {
    super();

    this.scenes = [];
    this.renderers = [];

    this[$entityMap] = new Map();
    this[$resources] = new Map();

    this.selected = window.$t = null;

    this.addEventListener('scene', e => this[$addScene](e));
    this.addEventListener('renderer', e => this[$addRenderer](e));
  }

  /**
   * API for extension, should not be called by content
   */

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
    if (!uuid) {
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

    console.log("SENDING ENTITY", data, uuid);
    this[$send]('entity', data);
  }

  __requestRenderer(index) {
    const renderer = this.renderers[+index];
    if (!renderer) {
      return;
    }

    const data = {
      id: index+'',
      info: {
        render: renderer.info.render,
        memory: renderer.info.memory,
      },
    };
    this[$send]('renderer', data);
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

  [$addScene]({ value }) {
    const scene = value;
    if (this.scenes.indexOf(scene) !== -1) {
      return;
    }
    this.scenes.push(scene);
    this[$entityMap].set(scene.uuid, scene);
    this.__requestEntity(scene.uuid);
  }

  [$addRenderer]({ value }) {
    const renderer = value;
    if (this.renderers.indexOf(renderer) !== -1) {
      return;
    }
    this.renderers.push(renderer);
    const id = this.renderers.indexOf(renderer);

    this.__requestRenderer(id);
  }

  [$log](...message) {
    if (DEBUG) {
      console.log('%c ThreeDevTools:', 'color:red', ...message);
    }
  }
};

})();
