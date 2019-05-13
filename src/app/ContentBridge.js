const $db = Symbol('db');
const $update = Symbol('update');
const $onMessage = Symbol('onMessage');
const $processSceneData = Symbol('processSceneData');

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
      chrome.devtools.inspectedWindow.eval(`ThreeDevTools.__refresh("${uuid||''}", "${typeHint}")`);
    } else {
      chrome.devtools.inspectedWindow.eval(`ThreeDevTools.__refresh("${uuid||''}")`);
    }
  }

  connect() {
    chrome.devtools.inspectedWindow.eval('ThreeDevTools.__connect()');
  }

  select(uuid) {
    const param = uuid ? JSON.stringify(uuid) : null;
    chrome.devtools.inspectedWindow.eval(`ThreeDevTools.__select(${param})`);
  }

  [$onMessage](request) {
    const { id, type, data } = request;

    switch (type) {
      case 'load':
        this[$db] = new Map();
        this.dispatchEvent(new CustomEvent('load'));
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
}
