import { html } from '../../../web_modules/lit-element.js'
import ThreeDevtoolsBaseElement from './ThreeDevtoolsBaseElement.js';

const $onSelectObject = Symbol('onSelectObject');
const $onClick = Symbol('onClick');

const PROPS = [
  { name: 'Type', property: 'type' },
  { name: 'UUID', property: 'uuid' },
  { name: 'Name', property: 'name' },
];

export default class ObjectViewElement extends ThreeDevtoolsBaseElement {
  static get properties() {
    return {
      ...ThreeDevtoolsBaseElement.properties,
    }
  }

  constructor() {
    super();
    this[$onSelectObject] = this[$onSelectObject].bind(this);

  }

  connectedCallback() {
    super.connectedCallback();
    this.app.addEventListener('select-object', this[$onSelectObject]);
  }
  
  disconnectedCallback() {
    super.disconnectedCallback();
    this.app.removeEventListener('select-object', this[$onSelectObject]);
  }

  render() {
    const object = this.app.getObject(this.uuid);

    if (!object) {
      return html`<div>no object selected</div>`;
    }

    console.log(object);
    return html`
<style>
  :host {
    display: block;
    width: 100%;
    height: 100%;
  }
</style>
<ul class="properties">
  <li>
    <span>Type</span><span>${object.type}</span>
  </li>
  <li>
    <span>UUID</span><span>${object.uuid}</span>
  </li>
  <li>
    <span>Name</span><span>${object.name}</span>
  </li>
</ul>
<geometry-view uuid="${object.geometry}">${object.geometry}</geometry-view>
<material-view uuid="${object.material}">${object.material}</material-view>
`;
  }

  [$onSelectObject](e) {
    this.uuid = e.detail.uuid;
  }
}
