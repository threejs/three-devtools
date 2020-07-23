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

    this.entityCache = new EntityCache();
    this.entitiesRecentlyObserved = new Set();

    this.devtoolsScene = null;

    this.selected = window.$t = null;

    // These events are dispatched by the extension, or
    // by the three.js library itself. Content could
    // also listen to these events and respond accordingly.
    this.target.addEventListener('observe', e => this.observe(e.detail));
    this.target.addEventListener('register', e => this.register(e.detail && e.detail.revision));
    this.target.addEventListener('select', e => this.select(e.detail && e.detail.uuid));
    // @TODO "update" is too general -- maybe something like "set-property"?
    this.target.addEventListener('entity-update', e => this.update(e.detail));
    window.ctor = this.target.constructor;

    // Underscored events are intended to be private.
    this.target.addEventListener('_request-rendering-info', e => this.requestRenderingInfo(e.detail && e.detail.uuid));
    this.target.addEventListener('_request-entity', e => this.requestEntity(e.detail && e.detail.uuid));
    this.target.addEventListener('_request-overview', e => this.requestOverview(e.detail && e.detail.type));
    this.target.addEventListener('_request-scene-graph', e => this.requestSceneGraph(e.detail && e.detail.uuid));
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
    this.log('select', uuid);
    const selected = this.entityCache.getEntity(uuid);

    if (selected) {
      if (this.devtoolsScene) {
        this.devtoolsScene.selectObject(selected);
      }
      this.selected = window.$t = selected;
    }
  }

  update({ uuid, property, value, dataType }) {
    this.log('update', uuid, property, value, dataType);
    const entity = this.entityCache.getEntity(uuid);

    if (!entity) {
      return;
    }

    const { target, key } = utils.getTargetAndKey(entity, property);

    if (dataType === 'color') {
      if (target[key] && target[key].isColor) {
        target[key].setHex(value);
      } else {
        // Use our own loaded version of THREE; using just
        // as a color data type, it shouldn't have any conflicts.
          target[key] = new Color((value >> 16 & 255) / 255,
                                  (value >> 8 & 255) / 255,
                                  (value & 255) / 255);
      } 
    }
    else if (dataType === 'enum') {
      target[key] = value === -1 ? null : value;
    }
    else {
      target[key] = value;
    }
  }

  register(revision) {
    this.log('register', arguments[0]);
    this.send('register', {
      revision, 
    });
  }

  requestSceneGraph(uuid) {
    this.log('requestSceneGraph', uuid);
    try {
      const data = this.entityCache.getSceneGraph(uuid);
      this.send('scene-graph', {
        uuid,
        graph: data,
      });
    } catch (e) {
      // Why must this be wrapped in a try/catch
      // to report errors? Where's the async??
      console.error(e);
    }
  }

  requestOverview(type) {
    this.log('requestOverview', type);
    try {
      const data = this.entityCache.getOverview(type);
      this.send('overview', {
        type,
        entities: data,
      });
    } catch (e) {
      // Why must this be wrapped in a try/catch
      // to report errors? Where's the async??
      console.error(e);
    }
  }

  requestEntity(uuid) {
    this.log('requestEntity', uuid);
    try {
      let data = this.entityCache.getSerializedEntity(uuid);
      if (data) {
        this.send('entity', data);
      }
    } catch (e) {
      // Why must this be wrapped in a try/catch
      // to report errors? Where's the async??
      console.error(e);
    }
  }

  requestRenderingInfo(uuid) {
    this.log('requestRenderingInfo', uuid);
    let data = this.entityCache.getRenderingInfo(uuid);
    if (data) {
      this.send('rendering-info', data);
    }
  }

  observe(entity) {
    this.log('observe', entity);
    const uuid = this.entityCache.add(entity);

    if (!uuid) {
      this.warn(`${uuid} is unobservable`);
      return;
    }

    // Fire on next tick; otherwise this is called when the scene is created,
    // which won't have any objects. Will have to explore more in #18.
    // Batch up multiple scenes added in the same tick.
    if (this.entitiesRecentlyObserved.size === 0) {
      requestAnimationFrame(() => {
        this.send('observe', {
          uuids: [...this.entitiesRecentlyObserved],
        });
        this.entitiesRecentlyObserved.clear();
      });
    }
 
    this.entitiesRecentlyObserved.add(uuid);
  }

  send(type, data) {
    this.log('emitting', type, data);
    try {
      window.postMessage({
        id: 'three-devtools',
        type: type,
        data,
      }, '*');
    } catch (e) {
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

  log(...message) {
    if (DEBUG) {
      console.log('%c ThreeDevTools:', 'color:red', ...message);
    }
  }

  warn(...message) {
    if (DEBUG) {
      console.warn('%c ThreeDevTools:', 'color:red', ...message);
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
