(function () {
	'use strict';

	var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);


	app.config(function($dkModalProvider) {
		$dkModalProvider.setDefaults({
			//backdropColor: 'rgba(0,0,255,.2)'
		})

	})

	app.controller('ctrl', function ($scope, $dkModal) {
		var $modal, dkModal;

		$scope.log = console.log.bind(console)
		/*
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
		 separation: 20, // integer (px), distance left or right of target
		 width: undefined, // string with px or %
		 height: undefined, // string with px or %
		 backdropColor: undefined // rgba(0,0,0,.2), must be rgba otherwise won't be transparent
		 };

		 */

		$scope.defBody = 'parent <i>body</i> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia'
		$scope.defHeader = 'Parent Default <b>Modal</b>'


		$scope.$on('modalOk', function() {
			console.log('ok event')
		})
		$scope.$on('modalCancel', function() {
			console.log('cancel event')
		})


		$scope.stringTemplateVal = 'string template binding';

		dkModal = $dkModal({
			//selector: '.selectorModal'
			//templateUrl: 'mymodal2.html', // mymodal.html (in cached) mymodal2.html (in file)
			template: '<div>My template:<br><br> {{stringTemplateVal}}</div>',
			scope: $scope,
			target: '.one',
			targetSide: 'right',
			width: '40%',
			height: undefined,
			targetVert: 'middle',
			//offsetTop: "9%",
			//offsetLeft: "50%"
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
				.then(function(initObj) {
					initObj.modal.off('ok');// if selector, need to clear old one
					initObj.modal.on('ok', function () {
						console.log('got it:', initObj.scope.user)
					})
					initObj.modal.on('cancel', function (e) {
						console.log('cancel')
					})
				}, function(err) {
					throw err;
				})

		}

		window.getdim = function () {
			var $one = $('one');
			console.log('dim', $one.outerWidth(), $one.outerHeight())
		}
	})

	app.controller('addCtrl', function ($scope) {
		$scope.$parent.$regScope($scope, 'addCtrl');

		$scope.userAgent = window.navigator.userAgent;
		$scope.user = {name: 'dank'}
		$scope.submit = function () {

		}
	})


})();
