
window.__THREE_DEVTOOLS__ = new class ThreeDevtools {
  constructor() {
    this.objects = new Map();
    this.renderer = null;
  }

  setRenderer(renderer) {
    this.renderer = renderer;
  }

  observe(...objects) {
    for (let object of objects) {
      const id = object.id;
      this.objects.set(id, object);
    }
    console.info('Observing', ...objects);
  }

  /**
   * Private API?
   */
  updateScenes() {
    for (let [id, object] of this.objects) {
      if (object.isScene) {
        this.send('data', object.toJSON());
        return;
      }
    }
  }

  update(id) {
    const object = this.scene.getObjectById(id);
    if (object) {
      this.send('data', object.toJSON());
    }
  }
  
  send(type, data) {
    window.postMessage({
      id: 'three-devtools',
      type: type,
      data,
    }, '*');
    console.log('post message', type, data);
  }
};
