export default (() => {

/**
 * Supported events:
 *
 * `scene`
 * `renderer`
 */
return class ThreeDevTools {
  constructor(target) {
    this.target = target;
    this.scenes = new Set();
    this.renderers = new Set();

    this.entityMap = new Map();
    this.resources = new Map();

    this.selected = window.$t = null;

    this.target.addEventListener('observe', e => this.observe(e.detail));
    this.target.addEventListener('refresh', e => this.refresh(e.detail && e.detail.uuid));
    this.target.addEventListener('select', e => this.select(e.detail && e.detail.uuid));
    this.target.addEventListener('update', e => this.update(e.detail));
  }

  /**
   * API for extension, should not be called by content
   */

  /**
   * This is the active object in the devtools viewer.
   */
  select(uuid) {
    const selected = this.entityMap.get(uuid);
    if (selected) {
      this.selected = window.$t = selected;
    }
  }

  update({ uuid, property, value, dataType }) {
    const item = this.entityMap.get(uuid);
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
          this.log('unknown dataType', dataType);
          item[property] = value;
      }
    }
  }

  refresh(id) {
    const entity = this.entityMap.get(id);
    if (!entity) {
      return;
    }

    let data;

    if (/renderer/.test(id)) {
      data = {
        type: 'renderer',
        id,
        info: {
          render: entity.info.render,
          memory: entity.info.memory,
        },
      };
    } else if (entity.isScene) {
      data = utils.serializeEntity(entity);

      // Observe all resources in all scenes so we can use
      // this object as a cache when serializing other entities.
      utils.mergeResources(this.resources, data);

      // Iterate through scene and tag all entities
      // (objects, materials, textures, etc.) and store
      // it in entityMap.
      utils.cacheEntitiesInScene(entity, this.entityMap);
    } else {
      // Hardcoded to use all scenes metadata for now.
      data = utils.serializeEntity(entity, this.resources);
    }

    this.send('entity', data);
  }

  send(type, data) {
    this.log('emitting', type, data);
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

  observe(value) {
    if (!value) {
      //console.error('ThreeDevTools#observe must have event detail.');
      return;
    }

    let id;

    if (value.isScene) {
      this.scenes.add(value);
      id = value.uuid;
    } else if (typeof value.render === 'function') {
      if (this.renderers.has(value)) {
        id = this.entityMap.get(value);
      } else {
        id = `renderer-${this.renderers.size}`;
      }
      this.renderers.add(value);
    } else {
      //console.error(`Unable to observe ${value}`);
      return;
    }

    if (!id) {
      return;
    }

    this.entityMap.set(id, value);

    // Fire on next tick; otherwise this is called when the scene is created,
    // which won't have any objects. Will have to explore more in #18.
    requestAnimationFrame(() => this.refresh(id));
  }

  log(...message) {
    if (DEBUG) {
      console.log('%c ThreeDevTools:', 'color:red', ...message);
    }
  }
};

})();
