import { MaterialTypes } from './constants.js';
import injection from './injection.js';
const $db = Symbol('db');
const $update = Symbol('update');
const $onMessage = Symbol('onMessage');
const $processSceneData = Symbol('processSceneData');
const $log = Symbol('log');
const $eval = Symbol('eval');
const $dispatchToContent = Symbol('dispatchToContent');
const $renderers = Symbol('renderers');
const $forceUpdate = Symbol('forceUpdate');

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
  }

  reload() {
    browser.devtools.inspectedWindow.reload();
  }

  get(uuid) {
    return this[$db].get(uuid);
  }

  getAllResources() {
    const output = {};

    const ids = [...this[$db].keys()];

    if (!ids.length) {
      return null;
    }

    for (let id of ids) {
      const object = this.get(id);
      const category = output[object.typeHint] = output[object.typeHint] || [];
      category.push(object);
    }

    return output;
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
      case 'committed':
        this[$db] = new Map();
        this[$renderers] = new Map();

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
    if (data.error) {
      console.warn(data);
    }
    if (data.geometries) {
      data.geometries.forEach(o => this[$update](o));
    }
    if (data.materials) {
      data.materials.forEach(o => this[$update](o));
    }
    if (data.textures) {
      data.textures.forEach(o => this[$update](o));
    }
    if (data.images) {
      data.images.forEach(o => this[$update](o));
    }
    if (data.shapes) {
      data.shapes.forEach(o => this[$update](o));
    }
    if (data.object) {
      this[$processSceneData](data.object);
    }
    if (data.uuid) {
      if (data.children) {
        const { children, ...filtered } = data;
        // Store the children directly rather than in
        // a potentially out of sync, denormalized way
        filtered.children = children.map(child => child.uuid);
        this[$update](filtered);
        children.forEach(o => this[$processSceneData](o));
      } else {
        this[$update](data);
      }
    }
  }

  [$update](object) {
    const uuid = object.uuid;

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
        typeHint: object.typeHint,
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

  async [$eval](string) {
    this[$log]('EVAL', string);
    const [result, error] = await browser.devtools.inspectedWindow.eval(string);
    if (error) {
      console.warn(error);
    }
    return result;
  }

  [$log](...message) {
    console.log('ContentBridge:', ...message);
  }
}
