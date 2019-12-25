import { MaterialTypes } from './constants.js';
import injection from './injection.js';
const $db = Symbol('db');
const $entityIdToCategory = Symbol('entityIdToCategory');
const $entitiesByCategory = Symbol('entitiesByCategory');
const $update = Symbol('update');
const $onMessage = Symbol('onMessage');
const $processSceneData = Symbol('processSceneData');
const $log = Symbol('log');
const $eval = Symbol('eval');
const $dispatchToContent = Symbol('dispatchToContent');
const $renderers = Symbol('renderers');
const $forceUpdate = Symbol('forceUpdate');

const VERBOSE_CONTENT_BRIDGE = true;

export default class ContentBridge extends EventTarget {
  /**
   * Events:
   * 'load'
   * 'update'
   */
  constructor() {
    super();

    this[$db] = new Map();
    this[$renderers] = new Map();
    this[$entityIdToCategory] = new Map();
    this[$entitiesByCategory] = {};

    this.port = browser.runtime.connect({
      name: 'three-devtools',
    });

    // @TODO I think this can be removed
    this.port.postMessage({
      name: 'connect',
      tabId: browser.devtools.inspectedWindow.tabId,
    });

    this.port.onDisconnect.addListener(request => {
      console.error('disconnected from background', request);
    });

    this.port.onMessage.addListener(e => this[$onMessage](e));
    
    document.addEventListener('keydown', e => {
      let mode, space;
      switch (e.key) {
        case 'q': space = true; break;
        case 'w': mode = 'translate'; break;
        case 'e': mode = 'rotate'; break;
        case 'r': mode = 'scale'; break;
      }

      if (mode || space) {
        this[$dispatchToContent]('_transform-controls-update', { mode, space });
      }
    }, { passive: true })
  }

  reload() {
    browser.devtools.inspectedWindow.reload();
  }

  get(uuid) {
    return this[$db].get(uuid);
  }

  getEntitiesOfType(type) {
    const idsOfSet = this[$entitiesByCategory][type];
    if (idsOfSet) {
      return [...idsOfSet].map(id => this.get(id));
    }
    return [];
  }

  /**
   * @TODO This entity categorization is rather messy;
   * should be a better way of storing original types
   * and categories on objects, in which case,
   * elements shouldn't have to reference ContentBridge
   * to determine the type.
   */
  getEntityCategory(uuid) {
    return this[$entityIdToCategory].get(uuid);
  }

  getRenderer(id) {
    return this[$renderers].get(id);
  }

  updateProperty(uuid, property, value, dataType) {
    const object = this.get(uuid);
    this[$dispatchToContent]('update', {
      uuid,
      property,
      value,
      dataType,
    });

    // Updating property won't trigger a data flush, instead update
    // the local state so that elements' values are in sync with their
    // HTML input state, important when switching between different items
    // with LitElement.

    object[property] = value;
    this[$forceUpdate](object);
  }

  /**
   * Request latest data from content for the object
   * with UUID.
   */
  refresh(uuid) {
    this[$dispatchToContent]('refresh', { uuid });
  }

  setPreset(preset) {
    let type;
    switch (preset) {
      case 'scene': type = 'scenes'; break;
      case 'geometry': type = 'geometries'; break;
      case 'material': type = 'materials'; break;
      case 'texture': type = 'textures'; break;
      //case 'rendering': type = 'renderers'; break;
      //case 'shapes': type = 'shapes'; break;
    }
    if (type) {
      this[$dispatchToContent]('_refresh-type', { type });
    }
  }

  select(uuid) {
    if (!uuid) {
      return;
    }
    this[$dispatchToContent]('select', { uuid });
  }

  [$onMessage](request) {
    const { id, type, data } = request;

    this[$log]('>>', type, data);
    switch (type) {
      case 'error':
        this[$eval](`console.warn("three-devtools: ${data}")`);
        break;
      case 'register':
        this.revision = data.revision;
        this[$eval](`console.log("three-devtools: debugging three.js r${this.revision}")`);
        break;
      case 'committed':
        this[$db] = new Map();
        this[$renderers] = new Map();
        this[$entityIdToCategory] = new Map();
        this[$entitiesByCategory] = {};

        this[$eval](injection);
        this.dispatchEvent(new CustomEvent('load'));
        break;
      case 'entity':
        if (data.type === 'renderer') {
          this[$renderers].set(data.id, data);
          this.dispatchEvent(new CustomEvent('renderer-update', {
            detail: data,
          }));
        } else {
          this[$processSceneData](data);
        }
        break;
    }
  }

  [$processSceneData](data) {
    if (data.geometries) {
      data.geometries.forEach(o => this[$update](o, 'geometries'));
    }
    if (data.materials) {
      data.materials.forEach(o => this[$update](o, 'materials'));
    }
    if (data.textures) {
      data.textures.forEach(o => this[$update](o, 'textures'));
    }
    if (data.images) {
      data.images.forEach(o => this[$update](o, 'images'));
    }
    if (data.shapes) {
      data.shapes.forEach(o => this[$update](o, 'shapes'));
    }
    if (data.uuid) {
      // @TODO store real types rather than checking user-modifiable type
      // to know if this is *actually* a scene.
      const type = data.type === 'Scene' ? 'scenes' : 'objects';
      if (data.children) {
        const { children, ...filtered } = data;
        // Store the children directly rather than in
        // a potentially out of sync, denormalized way
        filtered.children = children.map(child => child.uuid);
        this[$update](filtered, type);
        children.forEach(o => this[$processSceneData](o));
      } else {
        this[$update](data, type);
      }
    }
  }

  [$update](object, category) {
    const uuid = object.uuid;

    // Store an array of uuids by type.
    this[$entityIdToCategory].set(uuid, category);
    if (!this[$entitiesByCategory][category]) {
      this[$entitiesByCategory][category] = new Set();
    }
    this[$entitiesByCategory][category].add(uuid);


    let changed = false;

    if (this[$db].has(uuid)) {
      const pastState = this[$db].get(uuid);
      if (JSON.stringify(pastState) !== JSON.stringify(object)) {
        changed = true;
      }
    } else {
      changed = true;
    }

    if (changed) {
      this[$forceUpdate](object);
    }
  }

  [$forceUpdate](object) {
    this[$db].set(object.uuid, object);
    this.dispatchEvent(new CustomEvent('update', {
      detail: {
        object,
        uuid: object.uuid,
      },
    }));
  }

  [$dispatchToContent](type, detail) {
    this[$eval](`
      __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent('${type}', {
        detail: ${JSON.stringify(detail)},
      }));`
    );
  }

  _contentLog(string) {
    this[$eval](`console.log("${string}")`);
  }

  async [$eval](string) {
    this[$log]('EVAL', string);
    const [result, error] = await browser.devtools.inspectedWindow.eval(string);
    if (error) {
      console.warn(error);
    }
    return result;
  }

  [$log](...message) {
    if (VERBOSE_CONTENT_BRIDGE) {
      console.log('ContentBridge:', ...message);
    }
  }
}
