# dk-modal

An angular module for creating modal windows. The modal can be any size and placed anywhere on screen (center, viewport offset, target element offset). Dual purposed for general messages and data edit popups with separate css settings for each mode, say slower/darker for messages, faster/lighter for editing.

### demo  
[http://dankahle.github.io/dk-modal/](http://dankahle.github.io/dk-modal/)  

### features
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

### setup  
(not published to bower/npm yet)

`bower install dk-modal`  
  
`npm install dk-modal`  

### use
#### code
firing it up from a controller with an options object, and handling the jquery and scope broadcast events for ok button
```js
dkModal({
	selector: '.orderCompleteModal' // or templateUrl or template
	}).show()
	.then(function(modal) {
		modal.on('modalOk', function() { // jquery event
		...
		}
		$scope.$on('modalOk', function() { // scope event broadcast on this scope
			...
		}
	}
	
	$rootScope.modalInstance.hide('ok'); hiding modal from anywhere, 'ok' sends ok event, else get cancel event
````
#### dkModalTrigger directive
inside an ngRepeat loop, editing that specific item in popup mode, placed to the right/middle of a specified element
```html
<div ng-repeat="...">
<a href="" dk-modal-trigger="user.html" data-popup="true" data-target="#user{{$index}}_name">edit</a>
```
### configure  
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
height: undefined, // string with px or %, optional
// there's already separate css values for modal/poopup transition speed and background color/opacity
backdropColor: undefined,// rgba(0,0,0,.2), must be rgba otherwise won't be transparent, opacity is already used in css animation
cancelEventName: 'modalCancel', // string, alternate name for cancel event
okEventName: 'modalOk', // string, alternate name for ok event
// default template config values
defaultClose: true, // bool, show close icon/text upper right
defaultHeader: undefined, // string, optional,  $eval() value, so "'val'" for string or "val" for scope property, if falsey hides header
defaultBody: '', // string, required,  $eval() value, so "'val'" for string or "val" for scope property
defaultFooter: undefined, // string, optional, ok, okcancel, yesno, if falsey hides footer
};
```
### positioning  
By default, modal is positioned in center of viewport. Other options are: offset px or % from left and top of viewport (offsetLeft, offsetTop), and with respect to a target element (target, targetSide, targetVert, targetOffset). 

### width
Default width is a breakpiont dependent percentage with percentages decreasing with screen size. Setting width (px/%) in options will force to a fixed width.

### dkModalTrigger
Adding this directive to an element will cause it to trigger the specified modal. All options are available as data options with camelCase replaced with dashes: okEventName >> data-ok-event-name.  
dk-modal-trigger="selector/templateUrl", If ends in .html assumed a templateUrl, otherwise assumed a selector. Or data-selector="xxx" data-template-url="xxx". .  
** data-target="this" is a special case that makes the trigger element the target as well.  


  

[back to top](#dk-modal)





