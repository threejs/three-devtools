import { MaterialTypes } from './constants.js';
const $db = Symbol('db');
const $update = Symbol('update');
const $onMessage = Symbol('onMessage');
const $processSceneData = Symbol('processSceneData');
const $log = Symbol('log');
const $eval = Symbol('eval');
const $rendererInfo = Symbol('rendererInfo');
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
    this[$rendererInfo] = null;

    this.port = chrome.runtime.connect({
      name: 'three-devtools',
    });

    this.port.postMessage({
      name: 'connect',
      tabId: chrome.devtools.inspectedWindow.tabId,
    });

    this.port.onDisconnect.addListener(request => {
      console.error('disconnected from background', request);
    });

    this.port.onMessage.addListener(e => this[$onMessage](e));
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

  getRendererInfo() {
    return this[$rendererInfo];
  }

  updateProperty(uuid, property, value, dataType) {
    const object = this.get(uuid);
    const typeHint = object.typeHint;
    this[$eval](`ThreeDevTools.__updateProperty("${uuid}", "${typeHint}", "${property}", ${JSON.stringify(value)}, "${dataType}")`);

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
  refresh(uuid, typeHint) {
    if (typeHint) {
      this[$eval](`ThreeDevTools.__refresh("${uuid||''}", "${typeHint}")`);
    } else {
      this[$eval](`ThreeDevTools.__refresh("${uuid||''}")`);
    }
  }

  connect() {
    this[$eval]('ThreeDevTools.__connect()');
  }

  select(uuid) {
    if (!uuid) {
      return;
    }
    const param = JSON.stringify(uuid);
    const typeHint = this.get(uuid).typeHint;
    this[$eval](`ThreeDevTools.__select(${param}, '${typeHint}')`);
  }

  [$onMessage](request) {
    const { id, type, data } = request;

    this[$log]('>>', type, data);
    switch (type) {
      case 'load':
        this[$db] = new Map();
        this[$rendererInfo] = null;
        this.connect();
        this.dispatchEvent(new CustomEvent('connect'));
        break;
      case 'renderer-info':
        this[$rendererInfo] = data;
        this.dispatchEvent(new CustomEvent('renderer-info', {
          detail: {
            info: data,
          },
        }));
        break;
      case 'data':
        this[$processSceneData](data);
        break;
    }
  }

  [$processSceneData](data) {
    if (data.geometries) {
      data.geometries.forEach(o => this[$update](o, 'geometry'));
    }
    if (data.materials) {
      data.materials.forEach(o => this[$update](o, 'material'));
    }
    if (data.textures) {
      data.textures.forEach(o => this[$update](o, 'texture'));
    }
    if (data.images) {
      data.images.forEach(o => this[$update](o, 'image'));
    }
    if (data.shapes) {
      data.shapes.forEach(o => this[$update](o, 'shape'));
    }
    if (data.type) {
      if (MaterialTypes.includes(data.type)) {
        this[$update](data, 'material');
      } else if (data.type === 'Scene') {
        this[$update](data, 'scene');
      } else {
        this[$update](data, 'object');
      }
      if (data.children) {
        data.children.forEach(o => this[$processSceneData](o));
      }
    }
    if (data.object) {
      this[$processSceneData](data.object);
    }
  }

  [$update](object, typeHint) {
    const uuid = object.uuid;

    let changed = false;

    object.typeHint = typeHint;

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

  [$eval](string) {
    this[$log]('EVAL', string);
    chrome.devtools.inspectedWindow.eval(string);
  }

  [$log](...message) {
    // console.log('%c ContentBridge:', 'color:red', ...message);
  }
}
