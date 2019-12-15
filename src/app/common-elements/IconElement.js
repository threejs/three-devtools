import { LitElement, svg, html } from '../../../web_modules/lit-element.js'

// cube
// cubes
// flask (experiments)
// globe-africa, globe-americas, globe-asia, globe-europe (scene graph?)
// sitemap (scene graph?)
// sliders-h
// vr-cardboard
// dice-d20, dice-d6
// sync
// magic
// lightbulb (lights)
// search
// box/box-open (grouping?)
// brush (material?)
// chess-board (textures)
// eye (visibility)
export default class IconElement extends LitElement {
  static get properties() {
    return {
      "icon": { type: String, },
      "fill": { type: Boolean, }
    }
  }

  render() {
    const iconName = `${this.icon}${this.fill ? '' : '-outline'}`;
    return html`
<link rel="stylesheet" href="styles/fontawesome.css">
<style>
:host {
  display: inline-block;
  flex-shrink: 0;
  padding: 4px 8px;
}
:host([active]) {
  color: var(--selection-fg-color);
  background-color: var(--selection-bg-color);
}
i {
  font-size: 16px;
}
</style>
<i class="fa fa-${iconName}"></i>
`;
  }
}
