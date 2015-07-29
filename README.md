# dk-modal

An angular module for creating modal windows. Other modules expect all modals to be similar in many respects. This modal allows you control (on an individual basis): width (px/%), height (px/%), position (center/fixed offset in viewport/offset from target element horizontally and vertically (top/middle/bottom), keyboard, click, backdrop color/opacity. It also has a default template which allows you to specify just header/body/footer settings only, with optional header/footer and footer modes: (none/ok/okcancel/yesno) that automatically show the buttons and wire up ok or cancel close events. The default template has supporting css so you can use the template, or use its css classes in your own template. All animation is in css making it jank free and easy to modify, should you not like the default opacity animation. If device is mobile phone and modal has input controls, overrides size/positioning to full width - positioned at top.  

This and many other features such as: access to the modal's scope via a scope registration function, so you can, initialize the modal, then access the modal's scope (should it have one) before and after showing it. Separate ok/cancel events broadcast on both the modal (jquery style) and on $rootScope with definable ok/cancel event names. A solution for the infamous fuzzy/janky text associated with centered modals. Notice how nobody is centering modals? It's because opacity animation doesn't play well with css transforms. Namely the translateY(-50%) function required for vertically centering a modal of unknown height on the fly. This module calculates height in javascript, after running an angular digest cycle, allowing it to position the modal anywhere in any way, center being one, but also top/middle/bottom vertically with respect to a target element.


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





