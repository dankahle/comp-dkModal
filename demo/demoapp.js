(function () {
	'use strict';


	// draggable target
	$('#target').mousedown(function (e) {
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

		$scope.defBody = 'scope bound <i>hmtl</i>. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi. Nulla quis sem at nibh elementum imperdiet. Duis sagittis ipsum. Praesent mauris. Fusce nec tellus sed augue semper porta. Mauris massa. Vestibulum lacinia'
		$scope.defHeader = 'Default <i>Modal</i>'


		$scope.$on('modalOk', function () {
			console.log('ok event')
		})
		$scope.$on('modalCancel', function () {
			console.log('cancel event')
		})

		var opts = $scope.opts = {
			scope: $scope,
			test: {
				mode: 'desktop'
			}
		};

		$scope.showDefault = function () {
			$dkModal($.extend({}, opts, {
				templateUrl: 'dkModalTemplate.html',
				defaultHeader: 'defHeader',
				defaultBody: 'defBody',
				defaultFooter: 'okcancel'
			})).show('init');
		}

		$scope.showSelector = function () {
			$dkModal($.extend({}, opts, {selector: '.selModal'})).show('init');
		}

		$scope.showTemplateUrl = function () {
			var temp_dkModal = $dkModal($.extend({}, opts, {templateUrl: 'tempModal.html'}));
			temp_dkModal.init()
				.then(function(initObj) {
					initObj.scope.scope_tempCtrl.user = {name: 'Jim', age: 40}; // changing scope data before show
					temp_dkModal.show();// falsey here, as we've already called init
				}, function(err) {
					throw err;
				})
		}


		$scope.stringTemplateVal = 'string template binding';


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
		$scope.user = {name: 'dank', age: 50};
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
