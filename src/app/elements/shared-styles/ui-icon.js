export default `
/*
 * Styling taken from css/inspectorCommon.css from chrome devtools
 * (and adapted for compatability)
 */
[is=ui-icon] {
    display: inline-block;
    flex-shrink: 0;
}

.-theme-with-dark-background [is=ui-icon].icon-invert,
:host-context(.-theme-with-dark-background) [is=ui-icon].icon-invert {
    filter: invert(80%) hue-rotate(180deg);
}

[is=ui-icon].icon-mask {
    background-color: rgb(110, 110, 110);
    -webkit-mask-position: var(--spritesheet-position);
            mask-position: var(--spritesheet-position);
}

[is=ui-icon]:not(.icon-mask) {
    background-position: var(--spritesheet-position);
}

.spritesheet-smallicons:not(.icon-mask) {
    background-image: -webkit-image-set(url(assets/smallIcons.png) 1x, url(assets/smallIcons_2x.png) 2x);
    background-image: url(assets/smallIcons.png);
}

.spritesheet-smallicons.icon-mask {
    -webkit-mask-image: -webkit-image-set(url(assets/smallIcons.png) 1x, url(assets/smallIcons_2x.png) 2x);
            mask-image: url(assets/smallIcons.png);
}

.spritesheet-largeicons:not(.icon-mask) {
    background-image: -webkit-image-set(url(assets/largeIcons.png) 1x, url(assets/largeIcons_2x.png) 2x);
    background-image: url(assets/largeIcons.png);
}

.spritesheet-largeicons.icon-mask {
    -webkit-mask-image: -webkit-image-set(url(assets/largeIcons.png) 1x, url(assets/largeIcons_2x.png) 2x);
            mask-image: url(assets/largeIcons.png);
}

.spritesheet-mediumicons:not(.icon-mask) {
    background-image: -webkit-image-set(url(assets/mediumIcons.png) 1x, url(assets/mediumIcons_2x.png) 2x);
    background-image: url(assets/mediumIcons.png);
}

.spritesheet-mediumicons.icon-mask {
    -webkit-mask-image: -webkit-image-set(url(assets/mediumIcons.png) 1x, url(assets/mediumIcons_2x.png) 2x);
            mask-image: url(assets/mediumIcons.png);
}

.spritesheet-arrowicons {
    background-image: url(assets/popoverArrows.png);
}

:host-context(.force-white-icons) [is=ui-icon].spritesheet-smallicons, .force-white-icons [is=ui-icon].spritesheet-smallicons, [is=ui-icon].force-white-icons.spritesheet-smallicons, -theme-preserve {
    -webkit-mask-image: -webkit-image-set(url(assets/smallIcons.png) 1x, url(assets/smallIcons_2x.png) 2x);
            mask-image: url(assets/smallIcons.png);
    -webkit-mask-position: var(--spritesheet-position);
            mask-position: var(--spritesheet-position);
    background: #fafafa !important;
}

:host-context(.force-white-icons) [is=ui-icon].spritesheet-largeicons, .force-white-icons [is=ui-icon].spritesheet-largeicons, [is=ui-icon].force-white-icons.spritesheet-largeicons, -theme-preserve {
    -webkit-mask-image: -webkit-image-set(url(assets/largeIcons.png) 1x, url(assets/largeIcons_2x.png) 2x);
            mask-image: url(assets/largeIcons.png);
    -webkit-mask-position: var(--spritesheet-position);
            mask-position: var(--spritesheet-position);
    background: #fafafa !important;
}

:host-context(.force-white-icons) [is=ui-icon].spritesheet-mediumicon, .force-white-icons [is=ui-icon].spritesheet-mediumicons, [is=ui-icon].force-white-icons.spritesheet-mediumicons, -theme-preserve {
    -webkit-mask-image: -webkit-image-set(url(assets/mediumIcons.png) 1x, url(assets/mediumIcons_2x.png) 2x);
            mask-image: url(assets/mediumIcons.png);
    -webkit-mask-position: var(--spritesheet-position);
            mask-position: var(--spritesheet-position);
    background: #fafafa !important;
}
`;
