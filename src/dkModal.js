(function () {
	'use strict';

	if (!$)
		throw new Error('dkModal depends on jquery');
	if (!angular)
		throw new Error('dkModal depends on angular');

	var mod = angular.module('dkModal', ['ngAnimate']);

	mod.provider('$dkModal', function () {

		var obj = {},
			defaults = { // assume strings unless otherwise specified
				target: undefined, // jquery object
				selector: undefined,
				template: undefined,
				key: true,
				click: true,
				right: true,
				left: false,
				offsetTop: undefined, // integer
				offsetLeft: undefined, // integer
				separation: 20, // integer, distance left or right of target
				width: undefined, // string with px or %
				backdropColor: undefined,
				backdropOpacity: undefined // int/float 0 to 1
			};

		obj.setDefaults = function (opts) {
			angular.extend(defaults, opts);
		}

		obj.$get = function ($http, $templateCache, $animate, $rootScope) {
			return function (sentInOptions) {
				var get = {},
					isSelector = false,
					opts = angular.extend({}, defaults, sentInOptions),
					$modal, $backdrop;

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
							if (isSelector)
								$modal.hide();
							else
								$modal.remove();

							$modal.trigger(mode);
						})
				};

				///////////////////////// show
				get.show = function () {

					if (!opts.selector && !opts.template)
						throw new Error('Must set either dk-modal to selector or data-template to template');

					// get modal
					if (opts.selector) {
						isSelector = true;
						$modal = $(opts.selector);
						if ($modal.length == 0)
							throw new Error('Failed to find modal from selector: ' + opts.selector);
					}
					else if (opts.template) {
						if (!opts.scope)
							throw new Error('scope is required with template option');
						var html;
						if ((html = $templateCache.get(opts.template))) {
							$modal = $compile(html)(opts.scope);
						}
						else {
							$http.get(opts.template)
								.then(function (resp) {
									$templateCache.put(resp.data);
									$modal = $compile(resp.data)(opts.scope);
								}, function (err) {
									throw new Error('Failed to get modal template, error: ' + err.message ? err.message : err);
								})
						}
						if ($modal.length == 0)
							throw new Error('Failed to create modal from template: ' + opts.template);
					}

					// have modal

					// options precedence:
					// defaults < provider settings < modal data attrs < service call opts (either code or via dkModalTrigger element)
					var modalOpts = $modal.data();
					angular.extend(opts, modalOpts, sentInOptions);// here opts is already defaults < sentInOptions, which we need in earlier code, but now have to set the precedence again as we have the modal's data attrs to set which sentInOptions overrides. Confusing, but only way to do it.


					// setup $modal
					$modal.find('.exit-ok').click(exitHandlerOk);
					$modal.find('.exit-cancel').click(exitHandlerCancel);

					$modal.addClass('dk-modal');// in case they didn't
					$modal.attr('tabindex', '-1');// for keyboard input

					if(opts.key)
						$modal.on('keyup', keyHandler);

					if (opts.width)
						$modal.width = opts.width;
					if ($modal.find('input select textarea').length)
						$modal.addClass('input');// will force to top on phone (in css)

					// show modal offscreen so we can get accurate size readings.
					$modal.css('left', '10000px')
					if (isSelector)
						$modal.show()
					else
						body.prepend($modal)

					var modalWidth = $modal.outerWidth(),
						modalHeight = $modal.outerHeight();
					$modal.hide();
					$modal.css('left', '');

					// constrain height to viewport so scrollbars kick in if needed
					if (modalHeight > window.innerHeight) { // constrain height to viewport
						modalHeight = window.innerHeight;
						$modal.css('height', modalHeight + 'px');
					}
					else {
						$modal.css('height', '');
					}

					// clear any previous positioning
					$modal.css('top', '');
					$modal.css('left', '');
					$modal.css('transform', '');

					/*
					 // position (some here some css)
					 if phone && .input >> top, width 96% // we look for inputs and add .input
					 if phone >> vert center width
					 if >= @screen-sm:
					 if offsetLeft && offsetRight position put there,
					 if target position right of target w/ separation
					 if target and left or right, position left or right of target w/ separation
					 */

					// positioning
					if (opts.offsetTop && opts.offsetLeft) {// offset()
						$modal.css('transform', 'none'); // clear out css transform
						$modal.offset({top: opts.offsetTop, left: opts.offsetLeft});
					}
					else if (opts.target) {// target left/right
						$modal.css('transform', 'none'); // clear out css transform
						var side = opts.left || opts.right,
							$target = $(opts.target);
						if (!$target.length)
							throw new Error('Failed to locate target: ' + opts.target);

						var targetOffset = $target.offset(),
							targetWidth = $target.outerWidth(),
							modalLeft, modalTop;

						$modal.css('transform', '');// clear out transform if there

						if (side == 'right') {
							modalTop = $target.offset().top;
							if (targetOffset.left + targetWidth + opts.separation + modalWidth < window.innerWidth)
								modalLeft = targetOffset.left + targetWidth + opts.separation;
							else
								modalLeft = window.innerWidth - modalWidth;
						}
						else if (side == 'left') {
							modalTop = $target.offset().top;
							if (targetOffset.left - opts.separation - modalWidth > 0)
								modalLeft = targetOffset.left - opts.separation - modalWidth;
							else
								modalLeft = 0;
						}

						$modal.offset({
							top: modalTop,
							left: modalLeft
						})

					}

					// backdrop
					$backdrop = $('<div tabindex="-1" class="dk-modal-backdrop"></div>');

					if (opts.backgroundColor)
						$backdrop.css('background-color', opts.backgroundColor);
					if (opts.backgroundOpacity)
						$backdrop.css('opacity', opts.backgroundOpacity);

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

					return $modal; // so they can watch its events
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


})();


