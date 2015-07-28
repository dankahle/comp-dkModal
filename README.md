# dk-modal

An angular module for creating modals popups windows

## Features
* default template with preset layout and optional header/footer
* directive for auto-wiring element to trigger modal on click event
* configuration via object or data attributes on trigger element or modal itself
* default width/height dependent on breakpoint, plus config width/height as well
* positioning choices
  * forces modal to 100% width placed at top of screen for mobile phone "if modal has input elements"
    * default (vert/horiz center)
    * px/% fixed offset in viewport
    * px offset from target element with vertical choices of: top/middle/bottom
* control keyboard/click/
* opacity animation that's blur and jank free
* supports DOM element modal
* access to modal and scope before or after showing
* access to modal's childscope, should it have one


[back to top](#dk-modal)
