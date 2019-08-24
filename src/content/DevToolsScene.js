export default (THREE) => {

/**
 * `THREE` in this context is the devtools own version of three
 * injected into this scope only.
 */
return class DevToolsScene extends THREE.Scene {
  constructor(target, domElement, camera) {
    super();
    this.name = 'DevToolsScene';
    this.bbHelper = new THREE.Box3Helper(new THREE.Box3());
    this.bbHelper.material.depthWrite = false;
    this.bbHelper.material.depthRead = false;
 
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
    if (object.isObject3D && !object.isScene) {
      this.transformControls.attach(object);
    } else {
      this.transformControls.detach();
    }
    
    if (object.geometry) {
      let boundingBox = object.geometry.boundingBox;
      if (!boundingBox) {
        object.geometry.computeBoundingBox();
        boundingBox = object.geometry.boundingBox;
      }
      this.bbHelper.box = boundingBox;
      this.bbHelper.visible = true;
    } else {
      this.bbHelper.visible = false;
    }

    this.target.dispatchEvent(new CustomEvent('visualization-change'));
  }
}
};
