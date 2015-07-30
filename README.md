# dk-modal

An angular module for creating modal windows. 

## Demo  
[http://dankahle.github.io/dk-modal/](http://dankahle.github.io/dk-modal/)  

## Features
* supports DOM element and angular templateUrl modals
* default template option, all you need to supply is header (optional), body and footer (undefined/ok/okcancel/yesno)
* directive for auto-wiring element to trigger modal with all options as data attributes
* config: width/height/position to make any size and place anywhere
* positioning choices
  * mobile phone with input: full width, top of screen
  * default: horizontal/vertical center
  * px/% fixed offset in viewport
  * px offset from target element with vertical choices of: top/middle/bottom
* user defined ok/cancel $rootscope and modal events
* css opacity animation that's blur and jank free
* access to modal and its scope before or after showing

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





