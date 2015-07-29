# dk-modal

An angular module for creating modal windows

## Demo  
[http://dankahle.github.io/dk-modal/](http://dankahle.github.io/dk-modal/)  

## Features
* default template with preset layout and optional header/footer/close icon
* directive for auto-wiring element to trigger modal on click event
* configuration via object or data attributes on trigger element or modal itself
* default width/height dependent on breakpoint, plus config width/height as well
* positioning choices
  * forces modal to 100% width placed at top of screen for mobile phone "if modal has input elements"
  * default (vert/horiz center)
  * px/% fixed offset in viewport
  * px offset from target element with vertical choices of: top/middle/bottom
* config backdrop keyboard/click/color+opacity
* config/handle ok/cancel $rootscope and modal events
* opacity animation that's blur and jank free
* supports DOM element and angular templateUrl modals
* access to modal and scope before or after showing

## Use  
(not published to bower/npm yet)

### browser
`bower install dk-modal`  
`bower install`  
dependencies:  
jquery, angular, angular-animate, angular-sanitize, bootstrap variables.less (for breakpoints only)  

### develop
`npm install dk-modal`  
`npm install`
  
  
**7/29/15:**  
Currently working on this readme, should be done in a day or so, then will release version 1.0 and publish to bower/npm.


[back to top](#dk-modal)





