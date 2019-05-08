import { html } from '../../../web_modules/lit-element.js'
import ThreeDevtoolsBaseElement from './ThreeDevtoolsBaseElement.js';

export default class SceneViewElement extends ThreeDevtoolsBaseElement {
  static get properties() {
    return {
      ...ThreeDevtoolsBaseElement.properties,
    }
  }


  render() {
    const object = this.app.getObject(this.uuid);
    console.log('render object view', object);
    return html`
<style>
  :host {
    background-color: #eeffee;
    display: block;
    width: 100%;
    height: 100%;
    flex: 1;
  }
</style>
<p>${this.uuid}</p>
`;
  }
}
