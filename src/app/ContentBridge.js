const $db = Symbol('db');
const $update = Symbol('update');
const $onMessage = Symbol('onMessage');
const $processSceneData = Symbol('processSceneData');
const $log = Symbol('log');
const $eval = Symbol('eval');

export default class ContentBridge extends EventTarget {
  /**
   * Events:
   * 'load'
   * 'update'
   */
  constructor() {
    super();

    this[$db] = new Map();

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
    const param = uuid ? JSON.stringify(uuid) : null;
    const typeHint = this.get(uuid).typeHint;
    this[$eval](`ThreeDevTools.__select(${param}, '${typeHint}')`);
  }

  [$onMessage](request) {
    const { id, type, data } = request;

    this[$log]('>>', type);
    switch (type) {
      case 'load':
        this[$db] = new Map();
        this.connect();
        this.dispatchEvent(new CustomEvent('connect'));
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
    if (data.type || data.object) {
      let object = data.type ? data : data.object;

      // In this app, "Scene" is a special case of object.
      this[$update](object, object.type === 'Scene' ? 'scene' : 'object');
      if (object.children) {
        object.children.forEach(o => this[$processSceneData](o));
      }
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
      this[$db].set(uuid, object);
      this.dispatchEvent(new CustomEvent('update', {
        detail: {
          typeHint,
          object,
          uuid,
        },
      }));
    }
  }

  [$eval](string) {
    this[$log]('EVAL', string);
    chrome.devtools.inspectedWindow.eval(string);
  }

  [$log](...message) {
    console.log('%c ContentBridge:', 'color:red', ...message);
  }
}
