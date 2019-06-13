import { LitElement, html } from '../../../web_modules/lit-element.js'

export default class DevtoolsButtonElement extends LitElement {
  render() {
    return html`
<style>
  :host { 
    font-size: 13px;
    color: rgb(110, 110, 110);
    min-width: 28px;
    height: 26px;
    border: 1px solid rgb(221, 221, 221);
    background-color: rgb(243, 243, 243);

    cursor: pointer;
    display: flex;
    align-items: center;
    padding: 0 10px;
  }
</style>
<slot></slot>
`;
  }
}
