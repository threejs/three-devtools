import { html } from '../../../web_modules/lit-element.js'
import ThreeDevtoolsBaseElement from './ThreeDevtoolsBaseElement.js';

export default class TreeItemElement extends ThreeDevtoolsBaseElement {
  static get properties() {
    return {
      ...ThreeDevtoolsBaseElement.properties,
    }
  }

  constructor() {
    super();
  }

  render() {
    const object = this.app.getObject(this.uuid);

    console.log('render',object);
    const name = object ? (object.name || object.type) : '';
    const children = object && object.children ? object.children : [];
    return html`
<style>
  :host {
    height: 20px;
    width: 100%;
    display: block;
  }
</style>
<div>${name}</div>
<div id="children">
  ${children.map(child => html`<tree-item uuid=${child.uuid}></tree-item>`)}
</div>
`;
  }
}
