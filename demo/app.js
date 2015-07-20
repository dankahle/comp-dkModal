(function () {
	'use strict';

	var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);

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


		$scope.$on('okMe', function() {
			console.log('okMe event, your name is: ', $scope.scope_addCtrl.user.name)
		})
		$scope.$on('cancelMe', function() {
			console.log('cancelMe event')
		})



		dkModal = $dkModal({
			//selector: '.selectorModal'
			template: 'mymodal.html',
			scope: $scope,
			target: '.one',
			targetSide: 'right',
			width: '40%',
			height: undefined,
			targetVert: 'middle',
			backdropColor: 'rgba(255,0,0,.1)'
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

			var initObj = dkModal.show();

			initObj.modal.off('ok');// if selector, need to clear old one
			initObj.modal.on('ok', function () {
				console.log('got it:', initObj.scope.user)
			})
			initObj.modal.on('cancel', function (e) {
				console.log('cancel')
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
