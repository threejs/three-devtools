import { LitElement, html } from '../../../web_modules/lit-element.js'

export default class DevtoolsMessageElement extends LitElement {
  render() {
    return html`
<style>
  :host { 
    font-size: 13px;
    color: #777;
  }
  #container {
    width: 100%;
    height: 100%;
    display: flex;
    pointer-events: auto;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  ::slotted(*) {
    margin-bottom: 5px;
  }
</style>
<div id="container">
  <slot></slot>
</div>
`;
  }
}
