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
   * var(--title-color)
   * var(--title-background-color)
   * var(--title-border-color)
   */

  :host {
    height: 22px;
    width: 100%;
    display: flex;
    color: var(--title-color);
    background-color: var(--title-background-color);
    border-bottom: 1px solid var(--title-border-color);

    padding: 2px 0.8em;
    line-height: 15px;
    white-space: nowrap;
    align-items: center;
  }

  #title {
    text-overflow: ellipsis;
    overflow: hidden;
  }

</style>
<div id="title">${this.title}</div>
`;
  }
}
