import { html } from '../../../web_modules/lit-element.js'
import ThreeDevtoolsBaseElement from './ThreeDevtoolsBaseElement.js';

const $onSelectScene = Symbol('onSelectScene');

export default class SceneViewElement extends ThreeDevtoolsBaseElement {
  static get properties() {
    return {
      ...ThreeDevtoolsBaseElement.properties,
    }
  }

  constructor() {
    super();
    this[$onSelectScene] = this[$onSelectScene].bind(this);

  }

  connectedCallback() {
    super.connectedCallback();
            console.log('listening to select-scene');
    this.app.addEventListener('select-scene', this[$onSelectScene]);
    console.log('scene view connected');
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.app.removeEventListener('select-scene', this[$onSelectScene]);
  }

  render() {
    const scene = this.app.getObject(this.uuid);
    console.log('render sceneview', scene);
    return html`
<style>
  :host {
    background-color: #ffeeee;
    display: block;
    width: 100%;
    height: 100%;
    flex: 1;
  }
</style>
<div>
  <tree-item uuid=${this.uuid}></tree-item>
</div>
`;
  }

  [$onSelectScene](e) {
    console.log('on scene select', e);
    this.uuid = e.detail.uuid;
    this.setAttribute('uuid', e.detail.uuid);
    console.log(this.uuid, e.detail.uuid, SceneViewElement.properties);
  }
}
