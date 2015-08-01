# dk-modal

An angular module for creating modal windows. The modal can be any size and placed anywhere on screen (center, viewport offset, target element offset). Dual purposed for general messages and data edit popups with separate css settings for each mode, say slower/darker for messages, faster/lighter for editing.

## Demo  
[http://dankahle.github.io/dk-modal/](http://dankahle.github.io/dk-modal/)  

## Features
* supports DOM element and angular template modals
* default template option, all you need to supply is body and  optional header/footer (ok/okcancel/yesno)
* directive for auto-wiring element to trigger modal with all options as data attributes
* config: width/height/position to make any size and place anywhere
* positioning choices
  * mobile phone with input: full width, top of screen
  * default: horizontal/vertical center
  * px/% fixed offset in viewport
  * px offset from target element with vertical choices of: top/middle/bottom
* separate css settings for modal/popup modes
* user defined ok/cancel scope and modal events
* css opacity animation that's blur and jank free
* access to modal and any of its child scopes

## Setup  
(not published to bower/npm yet)

`bower install dk-modal`  
  
`npm install dk-modal`  

## Use
#### Code
firing it up from a controller with an options object, and handling the jquery and scope broadcast events for ok button
```js
dkModal({
	selector: '.orderCompleteModal',
	template: ' ... ',
	templateUrl: 'orderComplete.html',
	...other options
	}).show()
	.then(function(modal) {
		modal.on('modalOk', function() {
		...
		}
		$scope.$on('modalOk', function() {
			...
		}
	}
````
#### dkModalTrigger directive
inside an ngRepeat loop, editing that specific item in popup mode, placed to the right/middle of a specified element
```html
<div ng-repeat="...">
<a href="" dk-modal-trigger="user.html" data-target="#user{{$index}}_name" data-popup="true">edit</a>
```
## Configure  
```js
var defaults = {
popup: undefined, // bool, adds popup class for .popup css values
selector: undefined, // selector string or jquery element representing the modal
template: undefined, // string angular template
templateUrl: undefined, // string angular template url
key: true, // bool, escape key can close modal
click: true, // bool, mouse click can close modal
offsetTop: undefined, // MUST HAVE BOTH TOP AND LEFT, string with px or %, css centers by default
offsetLeft: undefined, // MUST HAVE BOTH TOP AND LEFT, string with px or %
target: undefined, // string or jquery element for positioning the modal against
targetSide: 'right', // string, left/right
targetVert: 'middle', // string, top/middle/bottom
targetOffset: 8, // number (in px), distance left or right of target
width: undefined, // string with px or %, css has breakpoint dependent default percentages 
height: undefined, // string with px or %, not needed
backdropColor: undefined, // rgba(0,0,0,.2), must be rgba otherwise won't be transparent, opacity is already used in css animation
cancelEventName: 'modalCancel', // string, alternate name for cancel event
okEventName: 'modalOk', // string, alternate name for ok event
// default template config values
defaultClose: true, // bool, show close icon/text upper right
defaultHeader: undefined, // $eval() value, so "'val'" for string or "val" for scope property, , if falsey hides header
defaultBody: '', // $eval() value, so "'val'" for string or "val" for scope property
defaultFooter: undefined, // ok, okcancel, yesno, if falsey hides footer
};
```
 
  

[back to top](#dk-modal)





