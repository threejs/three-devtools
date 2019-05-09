import { LitElement, html } from '../../../web_modules/lit-element.js'

export default class TitleBarElement extends LitElement {

  static get properties() {
    return {
      title: {type: String, reflect: true}
    }
  }

  render() {

    return html`
<style>
  /**
   * Current CSS API:
   *
   * --key-value-divider-position: 20%;
   * --key-value-padding-left: 10px;
   */

  :host {
    height: auto;
    width: 100%;
    display: flex;
  }

  #title {
  }

</style>
<div id="title">${this.title}</div>
`;
  }
}
