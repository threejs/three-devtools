window.SRC_CONTENT_INDEX = `
const $send = Symbol('send');
const $findByUUID = Symbol('findByUUID');

window.ThreeDevTools = new class ThreeDevTools {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.connected = false;

    this.selected = window.$t = null;

    this[$send]('init');
  }

  setRenderer(renderer) {
    this.renderer = renderer;
    this.__refresh();
  }

  setScene(scene) {
    this.scene = scene;
    this.__refresh();
  }
  
  /**
   * API for extension, should not be called by content
   */

  /**
   * Called when the devtools opens or shortly after
   * page load.
   */
  __connect() {
    this.connected = true;
    this.__refresh();
  }

  /**
   * This is the active object in the devtools viewer.
   */
  __select(uuid) {
    const selected = this[$findByUUID](uuid);
    console.log('__select', uuid, selected);
    if (selected) {
      this.selected = window.$t = selected;
    }
  }

  // TODO only fire once per frame
  __refresh(uuid, typeHint) {
    if (!this.connected) {
      return;
    }
    if (!uuid) {
      if (this.scene) {
        this[$send]('data', this.scene.toJSON());
      }
      return;
    }
    const item = this[$findByUUID](uuid, type);
    if (item) {
      this[$send]('data', item.toJSON());
    }
  }

  /**
   * Private
   */

  [$send](type, data) {
    console.log('sending data', data);
    try{
      window.postMessage({
        id: 'three-devtools',
        type: type,
        data,
      }, '*');
    } catch(e) {
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

  [$findByUUID](uuid, type) {
    if (!this.scene) {
      return;
    }

    if (this.scene.uuid === uuid) {
      return this.scene;
    }

    let objects = [this.scene];
    while (objects) {
      let object = objects.shift();

      switch (type) {
        case 'object':
          if (object.uuid === uuid) {
            return object;
          }
          break;
        case 'material':
          if (Array.isArray(object.material)) {
            let result = object.materials.find(m => m.uuid === uuid);
            if (result) {
              return result;
            }
          } else if (object.material && object.material.uuid === uuid) {
            return object.material;
          }
          break;
        case 'geometry':
          if (object.geometry && object.geometry.uuid === uuid) {
            return object.geometrt;
          }
          break;
        default:
          break;
      }

      if (object.children) {
        objects.push(...object.children);
      }
    }
  }
};
`;
