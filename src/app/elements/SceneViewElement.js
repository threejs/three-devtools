import { html } from '../../../web_modules/lit-element.js'
import ThreeDevtoolsBaseElement from './ThreeDevtoolsBaseElement.js';

const $onSelectScene = Symbol('onSelectScene');
const $onClick = Symbol('onClick');

export default class SceneViewElement extends ThreeDevtoolsBaseElement {
  static get properties() {
    return {
      ...ThreeDevtoolsBaseElement.properties,
    }
  }

  constructor() {
    super();
    this[$onSelectScene] = this[$onSelectScene].bind(this);
    this[$onClick] = this[$onClick].bind(this);

  }

  connectedCallback() {
    super.connectedCallback();
            console.log('listening to select-scene');
    this.app.addEventListener('select-scene', this[$onSelectScene]);
    this.addEventListener('click', this[$onClick]);
    console.log('scene view connected');
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.app.removeEventListener('select-scene', this[$onSelectScene]);
    this.removeEventListener('click', this[$onClick]);
  }

  render() {
    const scene = this.app.getObject(this.uuid);
    console.log('render sceneview', scene);

    if (!scene) {
      console.error('bailing, no scene');
      return;
    }

    const createNode = (obj, depth=0) => {
      console.log("creating obj", obj); 
      return html`
      <tree-item
        ?open="${obj.type === 'Scene'}"
        ?show-arrow="${obj.children ? obj.children.length > 0 : false}"
        depth="${depth++}"
        uuid="${obj.uuid}"
        >
        <div slot="content">${obj.name || obj.type}</div>
        ${obj.children ? obj.children.map(c => createNode(c, depth)) : null}
      </tree-item>
    `;
    }

    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
<div>
  ${createNode(scene)}
</div>
`;
  }

  [$onSelectScene](e) {
    this.uuid = e.detail.uuid;
  }

  [$onClick](e) {
    for (let target of e.composedPath()) {
      console.log(target);
      if (!target.hasAttribute) {
        // Shadow roots don't have attributes
        continue;
      }
      if (target.hasAttribute('uuid')) {
        const uuid = target.getAttribute('uuid');
        this.app.dispatchEvent(new CustomEvent('select-object', { detail: { uuid }}));
        return;
      }
    }
    console.warn('no node with uuid found?');
  }
}
