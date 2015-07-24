(function () {
	'use strict';


	// draggable target
	$('.target').mousedown(function (e) {
		var $this;
		if (e.which == 1) {
			$this = $(this);
			var offLeft = e.pageX - $this.offset().left;
			var offTop = e.pageY - $this.offset().top;

			$(document).mousemove(function (e) {
				$this.offset({top: e.pageY - offTop, left: e.pageX - offLeft});
			})

			$(document).mouseup(function (e) {
				console.log('turn off handler')
				$(document).off('mouseup mousemove');
			})

			return false;
		}
	})

	var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);


	app.config(function ($dkModalProvider) {
		$dkModalProvider.setDefaults({
			//backdropColor: 'rgba(0,0,255,.2)'
		})

	})

	app.controller('bodyCtrl', function ($scope, $dkModal) {
		var $modal, dkModal;

		$scope.log = console.log.bind(console)
		/*
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
		 targetOffset: 20, // number (in px), distance left or right of target
		 width: undefined, // string with px or %
		 height: undefined, // string with px or %
		 backdropColor: undefined, // rgba(0,0,0,.2), must be rgba otherwise won't be transparent
		 cancelEventName: 'modalCancel',
		 okEventName: 'modalOk',
		 defaultClose: true, // bool, show close icon/text upper right
		 defaultHeader: undefined, // $eval() value, so "'val'" for string or "val" for scope property, , if undefined/empty will hide header
		 defaultBody: '', // $eval() value, so "'val'" for string or "val" for scope property
		 defaultFooter: undefined, // ok, okcancel, yesno, if undefined/empty hide footer
		 test: {
		 mobileView: false
		 }
		 */

		$scope.defBody = '<p>This modal uses the dk-modal default template, which allows you to specify a data-bound header/body and footer mode. Header, footer, close icon are optional.';

		var defHeader = $scope.defHeader = 'Default Modal';

		$scope.selectorModalBody = "This modal is a dom element on the page. It's accessed with a jquery selector. Default positioning: center with width at set % base on breakpoint.";

		$scope.templateModalBody = "This modal is loaded from html file, then compiled/linked against the chosen scope. It has an input element, so will be positioned near top of screen for mobile phone.";

		window.$scope = $scope;//todo: remove

		$scope.$on('modalOk', function () {
			console.log('ok event')
		})
		$scope.$on('modalCancel', function () {
			console.log('cancel event')
		})

		// defaults
		$scope.position = 'default';
		$scope.showHeader = true;

		var opts = $scope.opts = {
			key: true,
			click: true,
			scope: $scope,
			targetSide: 'right',
			targetVert: 'middle',
			targetOffset: 20,
			defaultClose: true,
			defaultFooter: 'ok',
			test: {
				mode: navigator.userAgent.indexOf('Mobi') === -1? 'desktop': 'mobile'
			}
		};

		$scope.showDefault = function () {
			$dkModal($.extend({}, opts, {
				templateUrl: 'dkModalTemplate.html',
				defaultHeader: 'defHeader',
				defaultBody: 'defBody'
			})).show('init');
		}

		$scope.showSelector = function () {
			$dkModal($.extend({}, opts, {selector: '.selModal'})).show('init');
		}

		$scope.showTemplateUrl = function () {
			var temp_dkModal = $dkModal($.extend({}, opts, {templateUrl: 'tempModal.html'}));
			temp_dkModal.init()
				.then(function(initObj) {
					initObj.scope.scope_tempCtrl.user = {name: 'dank'}; // changing scope data before show
					temp_dkModal.show();// falsey here, as we've already called init
				}, function(err) {
					throw err;
				})
		}

		$scope.showTarget = function() {
			opts.target = '.target';
			$('.target').addClass('active');
		}

		$scope.hideTarget = function() {
			opts.target = undefined;
			$('.target').removeClass('active');
		}

		$scope.$watch('showHeader', function(val) {
			if(val === undefined)
				return;
			if(val)
				$scope.defHeader = defHeader;
			else
				$scope.defHeader = undefined;
		})


		$scope.show = function () {

			/*
			 var obj = dkModal.show();
			 obj.modal.on('ok cancel', function(e) {
			 console.log(e.type)
			 })
			 */

			//var obj = dkModal.init();
			//obj.scope.user = {name: 'carl'};

			dkModal.show('init')
				.then(function (initObj) {
					initObj.modal.off('ok');// if selector, need to clear old one
					initObj.modal.on('ok', function () {
						console.log('got it:', initObj.scope.user)
					})
					initObj.modal.on('cancel', function (e) {
						console.log('cancel')
					})
				}, function (err) {
					throw err;
				})

		}

		window.getdim = function () {
			var $one = $('one');
			console.log('dim', $one.outerWidth(), $one.outerHeight())
		}
	})

	app.controller('tempCtrl', function ($scope) {
		$scope.$parent.$regScope($scope, 'tempCtrl');
		$scope.user = {name: 'jim'};
	})


	var stringTemplate = '' +
		' <div id="one" ng-controller="addCtrl">' +
		' <span class="exit-cancel dk-modal-close">&times;</span>' +
		' <div class="dk-modal-header">Template Modal</div>' +
		' <div class="dk-modal-body">' +
		' <form id="myform">' +
		' Name: <input ng-model="user.name"><br>' +
		' Age: <input ng-model="user.age"><br>' +
		' </form>' +
		' </div>' +
		' <div class="dk-modal-footer">' +
		' <button type="button" form="myform" class="btn btn-default exit-cancel">Cancel</button>' +
		' <button type="submit" form="myform" class="btn btn-default exit-ok">Ok</button>' +
		' </div>' +
		' </div>';


})();
