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
    display: flex;
    color: var(--title-color);
    background-color: var(--title-background-color);
    border-bottom: 1px solid var(--title-border-color);

    line-height: 15px;
    white-space: nowrap;
    align-items: center;
    overflow: hidden;
  }

  #title {
    text-overflow: ellipsis;
    padding: 2px 0.8em;
    flex: 1;
  }

  ::slotted(*) {
    display: inline-block;
  }

</style>
<span id="title">
${this.title}
</span>
<slot></slot>
`;
  }
}
