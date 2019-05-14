import { LitElement, html } from '../../../web_modules/lit-element.js'

export default class FontAwesomeElement extends LitElement {
  static get properties() {
    return {
      type: {type: String, reflect: true},
      name: {type: String, reflect: true},
    }
  }

  constructor() {
    super();
    this.type = 'far';
  }

  render() {
    return html`
<link type="text/css" href="styles/fontawesome.css" rel="stylesheet" />
<style>
  :host {
    display: inline-block;
  }
</style>
<i class="${this.type} fa-${this.name}" />
`;
  }
}
