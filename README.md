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
firing it up from a controller with an options object, and handling the jquery and scope broadcast events
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
inside an ngRepeat loop allowing editing of that specific item with popup placed to the right/middle of a specific element
```html
<div ng-repeat="...">
<a href="" dk-modal-trigger="user.html" data-target="#user{{$index}}_name" data-popup="true">edit</a>
```
  
 
  

[back to top](#dk-modal)





