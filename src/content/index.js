const $send = Symbol('send');
const $findByUUID = Symbol('findByUUID');

window.ThreeDevTools = new class ThreeDevTools {
  constructor() {
    this.objects = new Map();
    this.renderer = null;
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

  flush(uuid, type='object') {
    if (!uuid && this.scene) {
      this[$send]('data', this.scene.toJSON());
    } else {
      const item = this[$findByUUID](uuid, type):
      if (item) {
        this[$send]('data', item.toJSON());
      }
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
