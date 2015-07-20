(function () {
	'use strict';

	if (!$)
		throw new Error('dkModal depends on jquery');
	if (!angular)
		throw new Error('dkModal depends on angular');


	function cleanOptions(opts) {

		$.each(opts, function(key, val) {
			if(typeof opts[key] == 'string')// jq doesn't trim
				opts[key] = opts[key].trim();
		});

		['offsetTop', 'offSetLeft', 'width', 'height']
			.forEach(function(v,i) {
				if(typeof opts[v] == 'number')
					opts[v] = opts[v] + 'px';
			})

		if(typeof opts.targetOffset == 'string' && opts.targetOffset.indexOf('px') != -1)
			opts.targetOffset = parseFloat(opts.targetOffset);

		return opts;
	}


	var mod = angular.module('dkModal', ['ngAnimate']);

	mod.provider('$dkModal', function () {

		//settings
		var screen_xs = 767,
			ESC = 27,
			phoneMarginPercent = 2, // this is percent of width so top gap matches side gaps
			phoneWidth = '96%' // phoneWidth + phoneMargin*2 must add to 100

		var obj = {},
			isMobile = window.navigator.userAgent.indexOf('Mobi') != -1;

		var defaults = {
			selector: undefined, // string or jquery element representing the modal
			template: undefined, // string url
			key: true, // bool
			click: true, // bool
			offsetTop: undefined, // string with px or %
			offsetLeft: undefined, // string with px or %
			target: undefined, // string or jquery element for positioning the modal against
			targetVert: 'middle', // top/middle/bottom
			targetSide: 'right', // left/right
			targetOffset: 20, // number (in px), distance left or right of target
			width: undefined, // string with px or %
			height: undefined, // string with px or %
			backdropColor: undefined, // rgba(0,0,0,.2), must be rgba otherwise won't be transparent
			cancelEventName: 'modalCancel',
			okEventName: 'modalOk'
		};

		obj.setDefaults = function (opts) {
			angular.extend(defaults, cleanOptions(opts));
		}

		obj.$get = /*@ngInject*/ ["$http", "$templateCache", "$compile", "$animate", "$rootScope", "$timeout", function ($http, $templateCache, $compile, $animate, $rootScope, $timeout) {
			return function (sentInOptions) {
				var get = {},
					isSelector = false,
					opts = angular.extend({}, defaults, cleanOptions(sentInOptions)),
					$modal, $backdrop, initObj;

				function exitHandlerOk(e) {
					$rootScope.$apply(function () {
						get.hide('ok');
					})
					return false;
				}

				function exitHandlerCancel(e) {
					$rootScope.$apply(function () {
						get.hide('cancel');
					});
					return false;
				}

				function keyHandler(e) {
					if (e.which == ESC)
						$rootScope.$apply(function () {
							get.hide('cancel');
						})
					return false;
				}

				function clickHandler() {
					$rootScope.$apply(function () {
						get.hide('cancel');
					})
					return false;
				}


				///////////////////////// hide
				get.hide = function (mode) {

					if (isSelector) { // remove handlers so we added so they don't duplicate next time
						$modal.find('.exit-ok').off('click', exitHandlerOk);
						$modal.find('.exit-cancel').off('click', exitHandlerCancel);
						$modal.off('keyup', keyHandler);
					}

					// I'd rather do enter/leave, but if selector, it's already in the dom, so we'll addClass instead
					$animate.removeClass($backdrop, 'open')
						.then(function () {
							$backdrop.remove()
						})

					$animate.removeClass($modal, 'open')
						.then(function () {
							var eventName = mode == 'ok' ? opts.okEventName : opts.cancelEventName;
							$modal.trigger(eventName);
							$rootScope.$broadcast(eventName);

							if (isSelector)
								$modal.hide();
							else
								$modal.remove();
						})
				};


				//////////////////////// init

				get.init = function () {

					// $regScope: helper function for child scopes (your modal has an ngController on it,
					// when you call this from that controller's scope, with your scope and name (see
					// $regScope above), then the scope you passed in in options, will have a property:
					// scope_yourName that you can use to access the child scope, to setup initial values
					// before showing.
					// eg: var childScope = $dkModal(opts).init().scope.scope_nameICalledRegScopeWith
					// childScope.user = {}
					// $dkModal.show();
					function $regScope(scope, name) {
						this['scope' + '_' + name] = scope;
					}

					if (!opts.selector && !opts.template)
						throw new Error('Must set either dk-modal to selector or data-template to template');

					// get modal
					if (opts.template) {
						if (!opts.scope)
							throw new Error('scope is required with template option');
						opts.scope.$regScope = $regScope; // attach $regScope to passed in scope for children to register with

						var html;
						if ((html = $templateCache.get(opts.template))) {
							$modal = $compile(html)(opts.scope);
						}
						else {
							$http.get(opts.template)
								.then(function (resp) {
									$templateCache.put(resp.data);
									$modal = $compile(resp.data)(opts.scope);
									safeDigest(opts.scope);
								}, function (err) {
									throw new Error('Failed to get modal template, error: ' + err.message ? err.message : err);
								})
						}
						if (!$modal || $modal.length === 0)
							throw new Error('Failed to create modal from template: ' + opts.template);
					}
					else if (opts.selector) {
						isSelector = true;
						$modal = $(opts.selector);
						if ($modal.length === 0)
							throw new Error('Failed to find modal from selector: ' + opts.selector);
					}
					// have modal

					/* options precedence:
					 1) service call opts (either code or via dkModalTrigger element)
					 2) modal data attrs
					 3) provider settings
					 4) defaults
					 */

					// now that we have modal opts apply them, but we had already applied sentInOptions earlier (needed in the above code), still, they outrank modal opts, so need to reapply them after modal opts.
					angular.extend(opts, cleanOptions($modal.data()), cleanOptions(sentInOptions));

					initObj = {modal: $modal, scope: (opts.scope && opts.scope.$modalChild) || opts.scope};
					return initObj; // for modal/childScope manipulation before show (see $regScope)
				}


				///////////////////////// show
				get.show = function (cb) {

					if (!initObj)
						get.init();

					// hack alert:
					// if we do our width/height calcs here, they'll all be off as this will be before angular binding, even though it's "after" the postlink call. It appears it needs one digest to get it together, this code provides that. After that we have accurate dimensions.
					if (opts.template) {
						$timeout(function () {
							doShow();
							if (cb)
								cb(initObj);
						})
						// if template and you need to do something with modal that involves the dimentions/position, then use the callback:
						// $dkModal.show(function(initObj) {... }

					}
					else {
						doShow();
						if (cb) // just in case they used callback and didn't need to
							cb(initObj);
					}

					return initObj;
				}

				function doShow() {
					var modalLeft, modalTop;


					var isPhone, hasInput;

					isPhone = isMobile && window.innerWidth <= screen_xs;
					hasInput = $modal.find('input, select, textarea').length > 0;

					// setup $modal
					$modal.find('.exit-ok').click(exitHandlerOk);
					$modal.find('.exit-cancel').click(exitHandlerCancel);

					$modal.addClass('dk-modal');// in case they didn't
					$modal.attr('tabindex', '-1');// for keyboard input

					if (opts.key)
						$modal.on('keyup', keyHandler);

					// WIDTH/HEIGHT MUST BE SET "BEFORE" WE SHOW OFFSCREEN TO GET WIDTH/HEIGHT, so we either get our setting or the css value
					// also, we have to reset here as well so we don't wipe out this setting later and we get the css width/height if there should be one.
					// set width
					if (opts.width) {

						var setWidth = opts.width.indexOf('%') != -1 ? window.innerWidth * parseInt(opts.width) / 100 : parseInt((opts.width));
						if (setWidth > window.innerWidth) {
							setWidth = window.innerWidth + 'px';
							//console.log('constrain width to:', window.innerWidth, 'of: ', window.innerWidth)
						}
						else
							setWidth = opts.width;

						$modal.css('width', setWidth);
					}
					else
						$modal.css('width', '');

					var phoneTopMargin = window.innerWidth * (phoneMarginPercent / 100);// % of width so matches side margin

					if (opts.height) {

						var setHeight = opts.height.indexOf('%') != -1 ? window.innerHeight * parseInt(opts.height) / 100 : parseInt((opts.height));

						if (isPhone && setHeight + phoneTopMargin > window.innerHeight) {
							setHeight = (window.innerHeight - phoneTopMargin) + 'px';
							//console.log('constrain setHeight to:', setHeight, 'of', window.innerHeight)
						}
						else if (setHeight > window.innerHeight) {
							setHeight = window.innerHeight + 'px';
							//console.log('constrain setHeight to:', setHeight, 'of', window.innerHeight)
						}
						else
							setHeight = opts.height;

						$modal.css('height', setHeight);
					}
					else
						$modal.css('height', '');

					// show modal offscreen so we can get accurate size readings.
					$modal.css('left', '-9999px')// this gets bad readings for +9999, what? If it goes off the screen to the right, (999 works on widescreen, but not on md) it gets innaccurate readings for some reason. Close mind you, but off on height by 20px on this test.
					$modal.show();
					if (!isSelector)
						$(document.body).prepend($modal)

					var modalWidth = $modal.outerWidth(),
						modalHeight = $modal.outerHeight();
					$modal.hide();
					$modal.css('left', '');

					// NEEDS TO BE AFTER OFFSCREEN CHECK, this mostly applies if !opts.height, but doens't hurt to do it again after ng binding
					// set height (if we need to constrain to viewport so scrollbars kick in)
					if (modalHeight + (isPhone ? phoneTopMargin : 0) > window.innerHeight) { // constrain height to viewport
						modalHeight = window.innerHeight - (isPhone ? phoneTopMargin : 0);
						$modal.css('height', modalHeight + 'px');
						//console.log('constrain height to:', modalHeight, 'innerHeight', window.innerHeight);
					}


					// clear any previous positioning
					$modal.css('top', '');
					$modal.css('left', '');
					$modal.css('transform', '');

					// positioning

					// css positions

					if (isPhone && hasInput) {
						$modal.css('transform', 'translate(0,0)');// clear out css translate
						$modal.css('top', phoneTopMargin + 'px');
						$modal.css('left', phoneMarginPercent + '%');
						$modal.css('width', phoneWidth);
					}
					else if (opts.offsetTop && opts.offsetLeft) {// offset()
						$modal.css('transform', 'translate(0,0)');// clear out css translate

						var adjTop = opts.offsetTop.indexOf('%') != -1 ? window.innerHeight * parseInt(opts.offsetTop) / 100 : parseInt((opts.offsetTop));

						var adjLeft = opts.offsetLeft.indexOf('%') != -1 ? window.innerWidth * parseInt(opts.offsetLeft) / 100 : parseInt((opts.offsetLeft));

						if (adjTop + modalHeight < window.innerHeight)
							modalTop = opts.offsetTop;
						else {
							modalTop = (window.innerHeight - modalHeight) + 'px';
							//console.log('adj top to:', modalTop);
						}

						if (adjLeft + modalWidth < window.innerWidth)
							modalLeft = opts.offsetLeft;
						else {
							modalLeft = (window.innerWidth - modalWidth) + 'px';
							//console.log('adj left to:', modalLeft);
						}

						/*
						 console.log('modal width/height', modalWidth, modalHeight)
						 console.log(modalLeft, modalTop)
						 */

						//warning: we can get inaccurate results using jquery.offset({top:xx, left:xx}) here so we'll just use css instead
						$modal.css('top', modalTop) // these are strings
						$modal.css('left', modalLeft)
					}
					else if (opts.target) {// target left/right
						$modal.css('transform', 'translate(0,0)');// clear out css translate
						var side = opts.targetSide || 'right',
							$target = $(opts.target);
						if (!$target.length)
							throw new Error('Failed to locate target: ' + opts.target);

						var targetOffset = $target.offset(),
							targetWidth = $target.outerWidth(),
							targetHeight = $target.outerHeight()

						if (side == 'right') {
							if (targetOffset.left + targetWidth + opts.targetOffset + modalWidth < window.innerWidth)
								modalLeft = targetOffset.left + targetWidth + opts.targetOffset;
							else {
								modalLeft = window.innerWidth - modalWidth;
								//console.log('adj left to:', modalLeft)
							}
						}
						else if (side == 'left') {
							if (targetOffset.left - opts.targetOffset - modalWidth > 0)
								modalLeft = targetOffset.left - opts.targetOffset - modalWidth;
							else {
								modalLeft = 0;
								//console.log('adj left to:', modalLeft)
							}
						}

						if (opts.targetVert == 'top')
							modalTop = targetOffset.top;
						else if (opts.targetVert == 'middle')
							modalTop = targetOffset.top - modalHeight / 2 + targetHeight / 2;
						else if (opts.targetVert == 'bottom')
							modalTop = targetOffset.top - modalHeight + targetHeight;

						// constrain vertically into viewport
						if (modalTop < 0) {
							modalTop = 0;
							//console.log('adj top to:', modalTop)
						}
						if (modalTop + modalHeight > window.innerHeight) {
							modalTop = window.innerHeight - modalHeight;
							//console.log('adj top to:', modalTop)
						}

						/*
						 console.log('targetOffset', targetOffset);
						 console.log('target width/height', targetWidth, targetHeight);

						 console.log('modal width/height', modalWidth, modalHeight)
						 console.log(modalLeft, modalTop)
						 */

						//warning: we can get inaccurate results using jquery.offset({top:xx, left:xx}) here so we'll just use css instead
						$modal.css('top', modalTop + 'px')
						$modal.css('left', modalLeft + 'px')
					}

					// backdrop
					$backdrop = $('<div tabindex="-1" class="dk-modal-backdrop"></div>');

					if (opts.backdropColor)
						$backdrop.css('background-color', opts.backdropColor);

					// backdrop
					if (opts.click)
						$backdrop.click(clickHandler)

					if (opts.key)
						$backdrop.keyup(keyHandler);

					// show
					$('body').prepend($backdrop);
					$backdrop.show();
					$animate.addClass($backdrop, 'open')

					$modal.show();
					$modal.focus();
					$animate.addClass($modal, 'open')
						.then(function () {
							$modal.trigger('show');
						})

				}

				return get; // so they can fire up service with options and call show/hide multiple times
			}
		}]

		return obj;
	})


	/*
	 dkModalTrigger:
	 put this on a link or button and it autofires the chosen modal with the data attributes applied.
	 Can just do: dk-modal-trigger=".someClass/#someId/someTemplate.html"
	 if ends in .html assumes a template otherwise assumes a jquery selector. Can also use: data-selector or data-template as well.
	 data-target is the reference element for positioning, if you do: data-target="this", it will
	 set this element as the target.
	 */
	mod.directive('dkModalTrigger', function () {
		return {
			restrict: 'A',
			controller: ["$scope", "$element", "$attrs", "$dkModal", function ($scope, $element, $attrs, $dkModal) {
				$element.click(function () {
					var opts = cleanOptions($element.data());
					if (opts.template)
						opts.scope = $scope; // if template, they'll need scope
					else if ($attrs.dkModalTrigger && /.html$/i.test($attrs.dkModalTrigger)) {
						opts.template = $attrs.dkModalTrigger;
						opts.scope = $scope; // if template, they'll need scope
					}
					else if (!opts.selector && $attrs.dkModalTrigger)
						opts.selector = $attrs.dkModalTrigger;

					if (!opts.template && !opts.selector)
						throw new Error('dkModal: Must supply either a template or selector')

					if (opts.target == 'this')
						opts.target = $element;

					$scope.$apply(function () {
						$dkModal(opts).show();
					})
				})

			}]
		}
	})

	//todo-feature: a default template that takes a simple message or string for display and runs
	// various modes like: yesno, okcancel, ok so all you need is a string and mode to put up
	// messages. Will need a default template less file that places everything nicely "plus" will
	// be reusable by others so all they have to do is use the same classes to get the same
	// results. This would mimick bootstrap's modal where you put in the classes and wallah
	// perfect modal.
	/*
	 mod.run(function ($templateCache) {
	 //$templateCache.put('dkModalTemplate.html', '');

	 // this will print out a script modal, but a lot of work to stringify it. The angular strap guy has a gulp plugin (gulp-ngtemplate) that will read the html and create a templateCache version.

	 setTimeout(function() {
	 console.log($templateCache.get('mymodal'))
	 }, 1000)
	 })

	 mod.directive('dkModalTemplate', function () {
	 return {
	 templateUrl: 'dkModalTemplate.html',
	 link: function (scope, elem, attr) {
	 scope.opts = elem.data();

	 }
	 }
	 })
	 */


})();



