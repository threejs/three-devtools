import injection from './injection.js';
import { isUUID } from './utils.js';
const $db = Symbol('db');
const $sceneGraphs = Symbol('sceneGraphs');
const $overviews = Symbol('overviews');
const $update = Symbol('update');
const $onMessage = Symbol('onMessage');
const $log = Symbol('log');
const $eval = Symbol('eval');
const $dispatchToContent = Symbol('dispatchToContent');
const $renderers = Symbol('renderers');

const VERBOSE_CONTENT_BRIDGE = false;

export default class ContentBridge extends EventTarget {
  /**
   * Events:
   * 'load'
   * 'entity-update' { object, uuid }
   * 'scene-graph-update' { uuid, graph }
   * 'overview-update' { type, entities }
   * 'renderer-update' {}
   */
  constructor() {
    super();

    this[$db] = new Map();
    this[$overviews] = new Map();
    this[$sceneGraphs] = new Map();
    this[$renderers] = new Map();

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

  getEntity(uuid) {
    return /renderer/.test(uuid) ? this[$renderers].get(uuid) : this[$db].get(uuid);
  }

  getEntityAndDependencies(rootUUID) {
    const data = {};
    const uuids = [rootUUID];
    while (uuids.length) {
      const uuid = uuids.shift();
      const entity = this.getEntity(uuid);
      if (entity && !data[entity.uuid]) {
        data[entity.uuid] = entity;

        // entities can have several dependencies, like textures on materials,
        // or a Mesh's geometry
        for (let value of Object.values(entity)) {
          if (isUUID(value)) {
            uuids.push(value);
          }
        }
      }
    }

    console.log(`dependencies of ${rootUUID}: ${Object.keys(data)}`);
    return data;
  }

  getResourcesOverview(type) {
    return this[$overviews].get(type);
  }

  getSceneGraph(uuid) {
    return this[$sceneGraphs].get(uuid);
  }

  updateProperty(uuid, property, value, dataType) {
    const object = this.getEntity(uuid);
    this[$dispatchToContent]('entity-update', {
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
    this[$update](object);
  }

  /**
   * Request latest data from content for the object
   * with UUID.
   */
  requestEntity(uuid) {
    this[$dispatchToContent]('_request-entity', { uuid });
  }

  requestOverview(type) {
    this[$dispatchToContent]('_request-overview', { type });
  }
  
  requestSceneGraph(uuid) {
    this[$dispatchToContent]('_request-scene-graph', { uuid });
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
        this.dispatchEvent(new CustomEvent('error', {
          detail: data,
        }));
        break;
      case 'register':
        this.revision = data.revision;
        this[$eval](`console.log("three-devtools: debugging three.js r${this.revision}")`);
        break;
      case 'committed':
        this[$db].clear();
        this[$overviews].clear();
        this[$sceneGraphs].clear();
        this[$renderers].clear();

        this[$eval](injection);
        this.dispatchEvent(new CustomEvent('load'));
        break;
      case 'observe':
        this.dispatchEvent(new CustomEvent('observe', {
          detail: {
            uuids: data.uuids,
          },
        }));
        break;
      case 'scene-graph':
        this[$sceneGraphs].set(data.uuid, data.graph);
        this.dispatchEvent(new CustomEvent('scene-graph-update', {
          detail: {
            uuid: data.uuid,
            graph: data.graph,
          },
        }));
        break;
      case 'overview':
        this[$overviews].set(data.type, data.entities);
        this.dispatchEvent(new CustomEvent('overview-update', {
          detail: {
            type: data.type,
            entities: data.entities,
          },
        }));
        break;
      case 'entity':
        debugger;
        if (data.type === 'renderer') {
          this[$renderers].set(data.id, data);
          this.dispatchEvent(new CustomEvent('renderer-update', {
            detail: data,
          }));
        } else if (Array.isArray(data)) {
          for (let entity of data) {
            this[$update](entity);
          }
        }
        break;
    }
  }

  [$update](entity) {
    this[$db].set(entity.uuid, entity);
    this.dispatchEvent(new CustomEvent('entity-update', {
      detail: {
        entity,
        uuid: entity.uuid,
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
