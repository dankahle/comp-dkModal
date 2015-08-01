(function () {
	'use strict';

	var log = console.log.bind(console);
	//var log = console.log = function(){} //todo-prod: reverse these log line comments

	var isMobile = window.navigator.userAgent.indexOf('Mobi') != -1;

	if (!$)
		throw new Error('dkModal depends on jquery');
	if (!angular)
		throw new Error('dkModal depends on angular');


	function cleanOptions(opts) {

		$.each(opts, function (key, val) {
			if (typeof opts[key] == 'string')// jq doesn't trim
				opts[key] = opts[key].trim();
		});

		['offsetTop', 'offsetLeft', 'width', 'height']
			.forEach(function (v, i) {
				if (typeof opts[v] == 'number' || (typeof opts[v] == 'string' && /^\d+$/.test(opts[v])))
					opts[v] = opts[v] + 'px';
			})

		if (typeof opts.targetOffset == 'string')
			opts.targetOffset = parseFloat(opts.targetOffset);

		// testing overrides
		if(opts.test && opts.test.mode == 'mobile')
			isMobile = true;
		else if(opts.test && opts.test.mode == 'desktop')
			isMobile = false;

		return opts;
	}


	var mod = angular.module('dkModal', ['ngAnimate', 'ngTouch', 'ngSanitize']);

	mod.provider('dkModal', function () {

		//settings
		var screen_xs = 767,
			ESC = 27,
			phoneMarginPercent = 2, // this is percent of width so top gap matches side gaps
			phoneWidth = '96%' // phoneWidth + phoneMargin*2 must add to 100

		var obj = {};


		var defaults = {
			popup: undefined, // bool, if truthy use popup css animation
			selector: undefined, // string or jquery element representing the modal
			template: undefined,
			templateUrl: undefined, // string url
			key: true, // bool
			click: true, // bool
			offsetTop: undefined, // MUST HAVE BOTH TOP AND LEFT, string with px or %
			offsetLeft: undefined, // MUST HAVE BOTH TOP AND LEFT, string with px or %
			target: undefined, // string or jquery element for positioning the modal against
			targetSide: 'right', // left/right
			targetVert: 'middle', // top/middle/bottom
			targetOffset: 8, // number (in px), distance left or right of target
			width: undefined, // string with px or %
			height: undefined, // string with px or %
			backdropColor: undefined, // rgba(0,0,0,.2), must be rgba otherwise won't be transparent, we're animating opacity so can't set that here
			cancelEventName: 'modalCancel',
			okEventName: 'modalOk',
			defaultClose: true, // bool, show close icon/text upper right
			defaultHeader: undefined, // $eval() value, so "'val'" for string or "val" for scope property, , if undefined/empty will hide header
			defaultBody: '', // $eval() value, so "'val'" for string or "val" for scope property
			defaultFooter: undefined, // ok, okcancel, yesno, if undefined/empty hide footer
			test: {
				mobileView: false
			}
		};

		obj.setDefaults = function (opts) {
			angular.extend(defaults, cleanOptions(opts));
		}

		obj.$get = /*@ngInject*/ function ($http, $templateCache, $compile, $animate, $rootScope, $timeout, $q) {
			return function (sentInOptions) {
				var get = {},
					isSelector = false,
					opts = angular.extend({}, defaults, cleanOptions(sentInOptions)),
					$modal, $backdrop;

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

					// we can't do enter/leave cause selector option modal is already in the dom
					$animate.removeClass($backdrop, 'open')
						.then(function () {
							$backdrop.remove()
						})

					$animate.removeClass($modal, 'open')
						.then(function () {
							var eventName = mode == 'ok' ? opts.okEventName : opts.cancelEventName;
							$modal.trigger(eventName);
							if(opts.scope)
								opts.scope.$broadcast(eventName);
							else
								$rootScope.$broadcast(eventName);

							if (isSelector)
								$modal.hide();
							else
								$modal.remove();

							$modal = undefined; // we'll force an init every time they call show, unless there's a repeated use case where it makes sense to leave it around.
						})
				};

				function getModal () {

					var def = $q.defer(); // if one path is async (templateUrl) it's an async function


					// $regScope: helper function for a child scope (should your modal have one), to register
					// the scope with your passed in scope, so it has access to the child scope after init()
					// and show() calls. See $scope.showTemplateUrl() in demo
					function $regScope(name, scope) {
						$rootScope.$regScopes = $rootScope.$regScopes || {};
						$rootScope.$regScopes[name] = scope
					}

					if (!opts.selector && !opts.template && !opts.templateUrl)
						throw new Error('Must set either selector or templateUrl');

					// get modal
					if(opts.template) {
						if (!opts.scope)
							throw new Error('Scope is required with template option');
						$modal = $compile(opts.template)(opts.scope);
						if (!$modal || $modal.length === 0)
							def.reject(new Error('Failed to get compile modal for template'));
						else
							resolvePromise();
					}
					else if (opts.templateUrl) {
						if (!opts.scope)
							throw new Error('scope is required with templateUrl option');
						opts.scope.$regScope = $regScope; // attach $regScope to passed in scope for children to register with

						if (opts.templateUrl == 'default' || opts.templateUrl == 'dkModalTemplate.html') { // setup scope for default template
							opts.templateUrl = 'dkModalTemplate.html';
							var newScope = opts.scope.$new(); // new scope so we don't junk up other scope
							newScope.close = opts.defaultClose;
							newScope.header = opts.scope.$eval(opts.defaultHeader);// allow it to be scope driven
							newScope.body = opts.scope.$eval(opts.defaultBody);// allow it to be scope driven
							newScope.footer = opts.defaultFooter;
							opts.scope = newScope;
						}

						var html;
						if ((html = $templateCache.get(opts.templateUrl))) {
							$modal = $compile(html)(opts.scope);
							if (!$modal || $modal.length === 0)
								def.reject(new Error('Failed to get compile modal for templateUrl: ' + opts.templateUrl));
							else
								resolvePromise();
						}
						else {
							$http.get(opts.templateUrl)
								.then(function (resp) {
									//log('cache opts.templateUrl')
									$templateCache.put(opts.templateUrl, resp.data);
									$modal = $compile(resp.data)(opts.scope);
									if (!$modal || $modal.length === 0)
										def.reject(new Error('Failed to get compile modal for templateUrl: ' + opts.templateUrl));
									else
										resolvePromise();
								}, function (err) {
									def.reject(new Error('Failed to get modal for template: ' + opts.templateUrl));
								})
						}
					}
					else if (opts.selector) {
						isSelector = true;
						$modal = $(opts.selector);
						if ($modal.length === 0)
							def.reject(new Error('Failed to find modal from selector: ' + opts.selector));
						else
							resolvePromise();
					}


					function resolvePromise() {
						/*
							The service call overrides all attributes set on the modal itself.
							The trigger calls the service with its data attributes, so its data attrs override the
							modal data attrs as well

							config precedence (highest to lowest):
						 1) service call opts, this includes dkModalTrigger data attrs which get rolled up into a serivce call
						 2) dk-modal element data attrs
						 3) provider setDefaults()
						 4) var defaults in provider
						*/

						// now that we have modal opts apply them, but we had already applied sentInOptions earlier (needed in the above code), still, they outrank modal opts, so need to reapply them after modal opts.
						angular.extend(opts, cleanOptions($modal.data()), cleanOptions(sentInOptions));

						def.resolve();
					}

					// this may or may not be resolved/rejected at this point, doesn't matter either way
					return def.promise;
				}


				get.show = function () {

					var def = $q.defer(),
						promise = def.promise;

					getModal()
						.then(function () {
							// we'll spin for a cycle to allow angular digest so we get a true height,
							// otherwise the height will be the handlebar height, not the content height
							$timeout(function() {
								doShow();
								def.resolve($modal); // return $modal to the user
							})

						}, function (err) {
							def.reject(err);
						})

					return promise;
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
					else { // default centering
						$modal.css('top', (window.innerHeight/2 - modalHeight/2) + 'px')
						$modal.css('left', (window.innerWidth/2 - modalWidth/2) + 'px')
					}

					// backdrop
					$backdrop = $('<div tabindex="-1" class="dk-modal-backdrop"></div>');

					if (opts.backdropColor)
						$backdrop.css('background-color', opts.backdropColor == 'none'? 'rgba(0,0,0,0)': opts.backdropColor);

					// backdrop
					if (opts.click)
						$backdrop.click(clickHandler)

					if (opts.key)
						$backdrop.keyup(keyHandler);

					if(opts.popup) {
						$backdrop.addClass('popup');
						$modal.addClass('popup');
					}

					// show
					$('body').prepend($backdrop);
					$backdrop.show();
					$animate.addClass($backdrop, 'open')

					$modal.show();
					// if element on modal has autofocus attr, focus the element, else focus the modal
					var $focusElem = $modal.find('[autofocus]');
					if($focusElem.length > 0)
						$focusElem.focus();
					else
						$modal.focus();

					$animate.addClass($modal, 'open')
						.then(function () {
							$modal.trigger('show');
						})

					// attach this service to rootscope for access to hide() from
					// the modal's template or controller: $scope.dkModalInstance.hide('ok'/'cancel'), there will only
					// be one up at a time so can reuse the property on each show() call
					$rootScope.dkModalInstance = get;
				}//show

				return get; // so they can fire up service with options and call show/hide multiple times
			}
		}

		return obj;
	})


	/*
	 dkModalTrigger:
	 put this on a link or button and it autofires the chosen modal with the data attributes applied.
	 Can just do: dk-modal-trigger=".someClass/#someId/someTemplate.html"
	 if ends in .html assumes a templateUrl otherwise assumes a jquery selector. Can also use: data-selector or data-template-url as well.
	 data-target is the reference element for positioning, if you do: data-target="this", it will
	 set this element as the target.
	 */
	mod.directive('dkModalTrigger', function () {
		return {
			restrict: 'A',
			controller: function ($scope, $element, $attrs, dkModal) {
				$element.click(function () {
					var opts = cleanOptions($element.data());
					if (opts.templateUrl)
						opts.scope = $scope; // if templateUrl, they'll need scope
					else if ($attrs.dkModalTrigger && /.html$/i.test($attrs.dkModalTrigger)) {
						opts.templateUrl = $attrs.dkModalTrigger;
						opts.scope = $scope; // if templateUrl, they'll need scope
					}
					else if (!opts.selector && $attrs.dkModalTrigger)
						opts.selector = $attrs.dkModalTrigger;

					if (!opts.templateUrl && !opts.selector)
						throw new Error('dkModal: Must supply either a templateUrl or selector')

					if (opts.target == 'this')
						opts.target = $element;

					$scope.$apply(function () {
						dkModal(opts).show()
					})
				})

			}
		}
	})

	var defaultTemplate = '' +
		'<div class="dk-modal"> ' +
		'<span class="dk-modal-close exit-cancel" ng-show="close">&times;</span> ' +
		'<div class="dk-modal-header" ng-show="header" ng-bind-html="header"></div> ' +
		'<div class="dk-modal-body" ng-bind-html="body"></div> ' +
		'<div class="dk-modal-footer" ng-show="footer"> ' +
		'<button class="btn btn-default exit-cancel dk-modal-button-no" ' +
		'ng-show="footer == \'yesno\'">No</button> ' +
		'<button class="btn btn-default exit-ok dk-modal-button-yes" ' +
		'ng-show="footer == \'yesno\'">Yes</button> ' +
		'<button class="btn btn-default exit-cancel dk-modal-button-cancel" ' +
		'ng-show="footer == \'okcancel\'">Cancel</button> ' +
		'<button class="btn btn-default exit-ok dk-modal-button-ok" ' +
		'                           ng-show="footer == \'okcancel\' || footer == \'ok\'">OK</button> ' +
		'</div> ' +
		'</div>';

	mod.run(function ($templateCache) {
		$templateCache.put('dkModalTemplate.html', defaultTemplate);
	})

})();


