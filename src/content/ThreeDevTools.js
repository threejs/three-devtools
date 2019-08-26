export default (() => {

/**
 * Supported events:
 *
 * `scene`
 * `renderer`
 */
return class ThreeDevTools {
  constructor(target) {
    this.USE_RENDER_OVERLAY = false;
    this.target = target;
    this.scenes = new Set();
    this.renderers = new Set();

    this.entityMap = new Map();
    this.resources = new Map();
    
    this.devtoolsScene = null;

    this.selected = window.$t = null;

    // These events are dispatched by the extension. Content could
    // also listen to these events and respond accordingly.
    // Underscored events are intended to be private.
    this.target.addEventListener('observe', e => this.observe(e.detail));
    this.target.addEventListener('refresh', e => this.refresh(e.detail && e.detail.uuid));
    this.target.addEventListener('select', e => this.select(e.detail && e.detail.uuid));
    // @TODO "update" is too general (and similar to "refresh") -- maybe
    // something like "set-property"?
    this.target.addEventListener('update', e => this.update(e.detail));

    this.target.addEventListener('_transform-controls-update', e => {
      if (this.devtoolsScene) {
        const { space, mode } = e.detail;
        // Space isn't a string, just a truthy value will trigger a toggle
        if (space) {
          this.devtoolsScene.toggleTransformSpace(space);
      	}
        if (mode) {
          this.devtoolsScene.setTransformMode(mode);
	      }
      }
    });
  
    // The 'visualization-change' event is fired by DevToolsScene, indicating
    // something has changed and if not rendering on a RAF loop, a render
    // is necessary to render the devtools content.
    // Noted here as documentation.
    // this.target.addEventListener('visualization-change', () => {});

    document.addEventListener('keydown', e => {
      if (!this.devtoolsScene) {
        return;
      }
      switch (e.key) {
        case 'q': this.devtoolsScene.toggleTransformSpace(); break;
        case 'w': this.devtoolsScene.setTransformMode('translate'); break;
        case 'e': this.devtoolsScene.setTransformMode('rotate'); break;
        case 'r': this.devtoolsScene.setTransformMode('scale'); break;
      }
    }, { passive: true })
    
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
      this.devtoolsScene.selectObject(selected);
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
          } else if (THREE) {
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
    if (!value || utils.isHiddenFromTools(value)) {
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
      if (this.renderers.size === 1) {
        this.setActiveRenderer(value);
      }
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

  createDevToolsScene(renderer, camera) {
    if (this.devtoolsScene) {
      return this.devtoolsScene;
    }

    this.devtoolsScene = new DevToolsScene(this.target, renderer.domElement, camera);
    return this.devtoolsScene;
  }

  setActiveRenderer(renderer) {
    // Hide the overlay rendering unless
    // enabled while some buggy cases are ironed out
    if (!this.USE_RENDER_OVERLAY) {
      return;
    }
    const render = renderer.render;
    const devtools = this;

    let devtoolsScene;
    renderer.render = function (scene, camera) {
      const target = renderer.getRenderTarget();
      render.call(this, scene, camera);
      
      if (!target) {
        if (!devtoolsScene) {
          devtoolsScene = devtools.createDevToolsScene(renderer, camera);
        }
        devtoolsScene.setCamera(camera);
        
        const autoClear = renderer.autoClear;
        renderer.autoClear = false;
        render.call(renderer, devtoolsScene, camera);
        renderer.autoClear = autoClear;
      }
    };
  }
};

})();
