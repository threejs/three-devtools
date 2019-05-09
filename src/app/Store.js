const $db = Symbol('db');
const $update = Symbol('update');
const $onMessage = Symbol('onMessage');

export default class Store extends EventTarget {
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
      console.log('disconnected from background');
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
      chrome.devtools.inspectedWindow.eval(`ThreeDevTools.refresh(${uuid||''}, ${typeHint})`);
    } else {
      chrome.devtools.inspectedWindow.eval(`ThreeDevTools.refresh(${uuid||''})`);
    }
  }

  [$onMessage](request) {
    const { id, type, data } = request;

    switch (type) {
      case 'data':
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
        if (data.object) {
          // In this app, "Scene" is a special case of object.
          this[$update](data.object, data.object.type === 'Scene' ? 'scene' : 'object');
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
