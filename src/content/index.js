const $send = Symbol('send');
const $findByUUID = Symbol('findByUUID');

window.ThreeDevTools = new class ThreeDevTools {
  constructor() {
    this.scene = null;
    this.renderer = null;
    this.connected = false;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  setScene(scene) {
    this.scene = scene;
  }
  
  /**
   * API for extension, should not be called by content
   */

  // Called when the panel first opens
  __connect() {
    this.connected = true;
    if (this.scene) {
      this[$send]('data', this.scene.toJSON());
    }
  }

  __refresh(uuid, type='object') {
    const item = this[$findByUUID](uuid, type);
    if (item) {
      this[$send]('data', item.toJSON());
    }
  }

  /**
   * Private
   */

  [$send](type, data) {
    window.postMessage({
      id: 'three-devtools',
      type: type,
      data,
    }, '*');
    console.log('post message', type, data);
  }

  [$findByUUID](uuid, type) {
    if (!this.scene) {
      return;
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

  log(message) {
    console.info(`__THREE_DEVTOOLS__: ${message}`);
  }
};
