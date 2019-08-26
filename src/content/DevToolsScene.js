export default (THREE) => {

/**
 * `THREE` in this context is the devtools own version of three
 * injected into this scope only.
 */
return class DevToolsScene extends THREE.Scene {
  constructor(target, domElement, camera) {
    super();
    this.onSelectedObjectRemove = this.onSelectedObjectRemove.bind(this);
    this.name = 'DevToolsScene';
    this.bbHelper = new THREE.BoxHelper();
    window.bbHelper = this.bbHelper;
    this.bbHelper.material.depthWrite = false;
    this.bbHelper.material.depthTest = false;
    this.bbHelper.visible = false;
    this.add(this.bbHelper);
 
    this.target = target;
    this.camera = camera;
    this.domElement = domElement;
    this.transformControls = new THREE.TransformControls(camera, domElement);
    this.transformControls.space = 'local';
    this.add(this.transformControls);

    utils.hideObjectFromTools(this);
    utils.hideObjectFromTools(this.bbHelper);
    utils.hideObjectFromTools(this.transformControls);

    this.transformControls.addEventListener('change', e => {
      // Fire an event to __THREE_DEVTOOLS__ so that content
      // can handle lazy rendering, indicating a rerender is necessary.
      this.target.dispatchEvent(new CustomEvent('visualization-change'));
    });

    this.transformControls.addEventListener('dragging-changed', e => {
      this.target.dispatchEvent(new CustomEvent('interaction-change', {
        detail: {
          active: e.value,
        },
      }));
    });
  }
  
  setTransformMode(mode) {
    if (mode && this.transformControls.mode !== mode) {
      this.transformControls.mode = mode;
    }
  }
  
  toggleTransformSpace() {
    const space = this.transformControls.space;
    this.transformControls.space = space === 'world' ? 'local' : 'world';
  }

  setCamera(camera) {
    this.camera = camera;
    this.transformControls.camera = camera;
  }

  selectObject(object) {
    if (this.selectedObject) {
      this.selectedObject.removeEventListener('removed', this.onSelectedObjectRemove);
      this.transformControls.detach();
    }

    this.selectedObject = object;
    this.bbHelper.visible = false;

    if (object && object.isObject3D && !object.isScene) {
      this.transformControls.attach(object);
      object.addEventListener('removed', this.onSelectedObjectRemove);
    }

    if (object) {
      const currentBBVersion = this.bbHelper.geometry.attributes.position.version;
      this.bbHelper.setFromObject(object);
      // Only way to determine if the object's bounding box is empty
      // or not without recomputing
      if (currentBBVersion !== this.bbHelper.geometry.attributes.position.version) {
        this.bbHelper.visible = true;
      }
    }

    this.target.dispatchEvent(new CustomEvent('visualization-change'));
  }

  onBeforeRender() {
    if (this.bbHelper.visible) {
      this.bbHelper.update();
    }
  }

  onSelectedObjectRemove() {
    this.selectObject(null);
  }
}
};
