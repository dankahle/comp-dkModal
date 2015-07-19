(function () {
	'use strict';

	if (!$)
		throw new Error('dkModal depends on jquery');
	if (!angular)
		throw new Error('dkModal depends on angular');

	var mod = angular.module('dkModal', ['ngAnimate']);

	mod.provider('$dkModal', function () {

		//settings
		var screen_xs = 767,
			phoneMarginPercent = 2, // this is percent of width so top gap matches side gaps
			phoneWidth = '96%' // phoneWidth + phoneMargin*2 must add to 100

		var obj = {},
			isMobile = window.navigator.userAgent.indexOf('Mobi') != -1;

		var defaults = { // assume strings unless otherwise specified
				target: undefined, // jquery object
				selector: undefined,
				template: undefined,
				key: true,
				click: true,
				targetVert: 'middle', // top/middle/bottom
				targetSide: 'right', // left/right
				offsetTop: undefined, // string px or %
				offsetLeft: undefined, // string px or %
				center: false, // bool
				separation: 20, // integer (px), distance left or right of target
				width: undefined, // string with px or %
				backdropColor: undefined // rgba(0,0,0,.2), must be rgba otherwise won't be transparent
			};

		obj.setDefaults = function (opts) {
			angular.extend(defaults, opts);
		}

		obj.$get = /*@ngInject*/ function ($http, $templateCache, $compile, $animate, $rootScope, $timeout) {
			return function (sentInOptions) {
				var get = {},
					isSelector = false,
					opts = angular.extend({}, defaults, sentInOptions),
					$modal, $backdrop, initObj;

				function exitHandlerOk(e) {
					$rootScope.$apply(function() {
						get.hide('ok');
					})
					return false;
				}

				function exitHandlerCancel(e) {
					$rootScope.$apply(function() {
						get.hide('cancel');
					})
					return false;
				}

				var ESC = 27;
				function keyHandler(e) {
					if (e.which == ESC)
						$rootScope.$apply(function() {
							get.hide('cancel');
						})
					return false;
				}

				function clickHandler() {
					$rootScope.$apply(function() {
						get.hide('cancel');
					})
					return false;
				}				///////////////////////// hide
				get.hide = function (mode) {

					if (isSelector) {
						$modal.find('.exit-ok').off('click', exitHandlerOk);
						$modal.find('.exit-cancel').off('click', exitHandlerCancel);
						$modal.off('keyup', keyHandler);
					}

					// I'd rather do enter/leave, but if selector, it's already in the dom, so we'll addClass instead
					$animate.removeClass($backdrop, 'open')
						.then(function() {
							$backdrop.remove()
						})

					$animate.removeClass($modal, 'open')
						.then(function () {
							$modal.trigger(mode);

							if (isSelector)
								$modal.hide();
							else
								$modal.remove();
						})
				};

				//////////////////////// init

				get.init = function(cb) {

					function $regScope(scope) {
						this.$modalChild =  scope;
					}

					if (!opts.selector && !opts.template)
						throw new Error('Must set either dk-modal to selector or data-template to template');

					// get modal
					if (opts.selector) {
						isSelector = true;
						$modal = $(opts.selector);
						if ($modal.length === 0)
							throw new Error('Failed to find modal from selector: ' + opts.selector);
					}
					else if (opts.template) {
						if (!opts.scope)
							throw new Error('scope is required with template option');
						opts.scope.$regScope = $regScope; // child needs to call this on compilation

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
						if ($modal.length === 0)
							throw new Error('Failed to create modal from template: ' + opts.template);
					}
					// have modal

					/* options precedence:
					1) service call opts (either code or via dkModalTrigger element)
					2) modal data attrs
					3) provider settings
					4) defaults
				 */

					// now that we have modal opts apply them, but we had already applied sentInOptions earlier (needed in the above code), still, they outrank modal opts, so need to reapply them after modal opts.
					angular.extend(opts, $modal.data(), sentInOptions);

					initObj = {modal: $modal, scope: (opts.scope && opts.scope.$modalChild) || opts.scope};

					$timeout(function() {
						cb(initObj);
					})

					return (initObj);// so they can mess with modal and it's scope "before" show. If it has ng-controller (its own scope), it needs to register this with parent to be available here: $parent.$regScope(scope) call)
				}

				///////////////////////// show
				get.show = function () {
					var modalLeft, modalTop;

					if(!initObj)
						get.init();

					var isPhone, hasInput;

					isPhone =  isMobile && window.innerWidth <= screen_xs;
					hasInput = $modal.find('input, select, textarea').length > 0;

					// setup $modal
					$modal.find('.exit-ok').click(exitHandlerOk);
					$modal.find('.exit-cancel').click(exitHandlerCancel);

					$modal.addClass('dk-modal');// in case they didn't
					$modal.attr('tabindex', '-1');// for keyboard input

					if(opts.key)
						$modal.on('keyup', keyHandler);

					// WIDTH/HEIGHT MUST BE SET "BEFORE" WE SHOW OFFSCREEN TO GET WIDTH/HEIGHT, so we either get our setting or the css value
					// also, we have to reset here as well so we don't wipe out this setting later and we get the css width if there should be one.
					// set width
					if(opts.width) {

						var setWidth = opts.width.indexOf('%') != -1? window.innerWidth * parseInt(opts.width)/100: parseInt((opts.width));
						if(setWidth > window.innerWidth) {
							setWidth = window.innerWidth + 'px';
							console.log('constrain width to:', window.innerWidth)
						}
						else
							setWidth = opts.width;

						$modal.css('width', setWidth);
					}
					else
						$modal.css('width', '');

					 // show modal offscreen so we can get accurate size readings.
					 $modal.css('left', '-9999px')// this gets bad readings for +9999, what? If it goes off the screen to the right, (999 works on widescreen, but not on md) it gets innaccurate readings for some reason. Close mind you, but off on height by 20px on this test.
					$modal.show();
					 if (!isSelector)
						 $(document.body).prepend($modal)

					 var modalWidth = $modal.outerWidth(),
					 modalHeight = $modal.outerHeight();
					 $modal.hide();
					 $modal.css('left', '');


					// NEEDS TO BE AFTER OFFSCREEN CHECK
					// set height (if we need to constrain to viewport so scrollbars kick in)
					var phoneTopMargin = window.innerWidth * (phoneMarginPercent/100);// % of width so matches side margin
					if (modalHeight + (isPhone? phoneTopMargin: 0) > window.innerHeight) { // constrain height to viewport
						modalHeight = window.innerHeight - (isPhone? phoneTopMargin: 0);
						$modal.css('height', modalHeight + 'px');
						console.log('constrain height to:', modalHeight, 'innerHeight', window.innerHeight );
					}
					else
						$modal.css('height', '');


					// clear any previous positioning
					$modal.css('top', '');
					$modal.css('left', '');
					$modal.css('transform', '');

					// positioning

					// css positions

					if(isPhone && hasInput) {
						$modal.css('transform', 'translate(0,0)');// clear out css translate
						$modal.css('top', phoneTopMargin +  'px');
						$modal.css('left', phoneMarginPercent + '%');
						$modal.css('width', phoneWidth);
					}
					else if (opts.offsetTop && opts.offsetLeft) {// offset()
						$modal.css('transform', 'translate(0,0)');// clear out css translate

						var adjTop = opts.offsetTop.indexOf('%') != -1? window.innerHeight * parseInt(opts.offsetTop)/100: parseInt((opts.offsetTop));

						var adjLeft = opts.offsetLeft.indexOf('%') != -1? window.innerWidth * parseInt(opts.offsetLeft)/100: parseInt((opts.offsetLeft));

						if (adjTop + modalHeight < window.innerHeight)
							modalTop = opts.offsetTop;
						else {
							modalTop = (window.innerHeight - modalHeight) + 'px';
							console.log('adj top to:', modalTop);
						}

						if (adjLeft + modalWidth < window.innerWidth)
							modalLeft = opts.offsetLeft;
						else {
							modalLeft = (window.innerWidth - modalWidth) + 'px';
							console.log('adj left to:', modalLeft);
						}

/*
						$modal.css('top', modalTop)
						$modal.css('left', modalLeft)

						console.log('modal width/height', modalWidth, modalHeight)
						console.log(modalLeft, modalTop)
*/

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
							if (targetOffset.left + targetWidth + opts.separation + modalWidth < window.innerWidth)
								modalLeft = targetOffset.left + targetWidth + opts.separation;
							else {
								modalLeft = window.innerWidth - modalWidth;
								console.log('adj left to:', modalLeft)
							}
						}
						else if (side == 'left') {
							if (targetOffset.left - opts.separation - modalWidth > 0)
								modalLeft = targetOffset.left - opts.separation - modalWidth;
							else {
								modalLeft = 0;
								console.log('adj left to:', modalLeft)
							}
						}

						if(opts.targetVert == 'top')
							modalTop = targetOffset.top;
						else if(opts.targetVert == 'middle')
							modalTop = targetOffset.top - modalHeight/2 + targetHeight/2;
						else if(opts.targetVert == 'bottom')
							modalTop = targetOffset.top - modalHeight + targetHeight;

						// constrain vertically into viewport
						if(modalTop < 0) {
							modalTop = 0;
							console.log('adj top to:', modalTop)
						}
						if(modalTop + modalHeight > window.innerHeight) {
							modalTop = window.innerHeight - modalHeight;
							console.log('adj top to:', modalTop)
						}

						console.log('targetOffset', targetOffset);
						console.log('target width/height', targetWidth, targetHeight);

						console.log('modal width/height', modalWidth, modalHeight)
						console.log(modalLeft, modalTop)

						$modal.css('top', modalTop + 'px')
						$modal.css('left', modalLeft + 'px')
					}

					// backdrop
					$backdrop = $('<div tabindex="-1" class="dk-modal-backdrop"></div>');

					if (opts.backgroundColor)
						$backdrop.css('background-color', opts.backdropColor);

					// backdrop
					if (opts.click)
						$backdrop.click(clickHandler)

					if(opts.key)
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

					return initObj; // so they can watch its events
				}

				return get; // so they can fire up service with options and call show/hide multiple times
			}
		}

		return obj;
	})

	mod.directive('dkModalTrigger', function () {
		return {
			restrict: 'A',
			controller: function ($scope, $element, $attrs, $dkModal) {
				$element.click(function () {
					var opts = $element.data();
					if (opts.template)
						opts.scope = $scope; // if template, they'll need scope
					if (!opts.selector && $attrs.dkModalTrigger)
						opts.selector = $attrs.dkModalTrigger;
					$scope.$apply(function() {
						$dkModal(opts).show();
					})
				})

			}
		}
	})

	mod.run(function($templateCache) {

		$templateCache.put('dkModalTemplate.html', '');


/*
 // this will print out a script modal, but a lot of work to stringify it. The angular strap guy has a gulp plugin (gulp-ngtemplate) that will read the html and create a templateCache version.

			setTimeout(function() {
			console.log($templateCache.get('mymodal'))
		}, 1000)
*/

	})

	mod.directive('dkModalTemplate', function() {
		return {
			templateUrl: 'dkModalTemplate.html',
			link: function(scope, elem, attr) {
				scope.opts = elem.data();

			}
		}
	})


})();



