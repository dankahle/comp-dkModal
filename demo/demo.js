(function () {
	'use strict';

	var log = console.log.bind(console);
	//var log = console.log = function(){} //todo-prod: reverse these log line comments

	$('.target').draggable();

	var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);

	app.config(function (dkModalProvider) {
		dkModalProvider.setDefaults({
			//backdropColor: 'rgba(0,0,255,.2)'
		})

	})

	app.controller('bodyCtrl', function ($scope, dkModal) {

		$scope.defBody = '<p>This modal uses the dk-modal default template, which allows you to specify a data-bound header/body and footer mode. Header, footer, close icon are optional.';

		var defHeader = $scope.defHeader = 'Default Modal';

		$scope.selectorModalBody = "This modal is a dom element on the page. It's accessed with a jquery selector. Default positioning: modal centered in viewport with width at set % based on breakpoint.";

		$scope.templateModalBody = "This modal is loaded from html file, then compiled/linked against the chosen scope. It has an input element, so will be positioned near top of screen for mobile phone.";

		$scope.qrcodeBody = "<img src='qrcode.png' width='148' height=148>";

		window.$scope = $scope;//todo: remove

		// defaults
		$scope.position = 'default';
		$scope.showHeader = true;
		$scope.backdropColor = '#000000';
		$scope.backdropOpacity = 0.2;

		var opts = $scope.opts = {
			key: true,
			click: true,
			scope: $scope,
			defaultClose: true,
			defaultFooter: 'ok',
			test: {
				mode: navigator.userAgent.indexOf('Mobi') === -1? 'desktop': 'mobile'
			}
		};
		$scope.offsetOpts = {
		}
		$scope.targetOpts = {
			targetSide: 'right',
			targetVert: 'middle'
		}

		function getPositionOpts() {
			if($scope.position == 'default')
				return {};
			else if($scope.position == 'offset')
				return $scope.offsetOpts;
			else if($scope.position == 'target')
				return $scope.targetOpts;
		}

		$scope.showDefault = function () {
			dkModal($.extend({}, opts, getPositionOpts(), {
				templateUrl: 'dkModalTemplate.html',
				defaultHeader: 'defHeader',
				defaultBody: 'defBody',
				backdropColor: $scope.backdropRgba
			})).show('init');
		}

		$scope.showSelector = function () {
			dkModal($.extend({}, opts, getPositionOpts(), {
				selector: '.selModal',
				backdropColor: $scope.backdropRgba
			})).show('init');
		}

		$scope.showTemplateUrl = function () {
			var temp_dkModal = dkModal($.extend({}, opts, getPositionOpts(), {
				templateUrl: 'tempModal.html',
				width: '288px',
				backdropColor: $scope.backdropRgba
			}));
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
			$('.target').addClass('in');
		}

		$scope.hideTarget = function() {
			opts.target = undefined;
			$('.target').removeClass('in');
		}

		$scope.$watch('showHeader', function(val) {
			if(val === undefined)
				return;
			if(val)
				$scope.defHeader = defHeader;
			else
				$scope.defHeader = undefined;
		})

		$scope.$watch('opts.test.mode', function(val) {
			if(val === undefined)
				return;
			$('html').addClass(val === 'mobile'? 'mobile': 'no-mobile');
			$('html').removeClass(val === 'mobile'? 'no-mobile': 'mobile');
		})

		$scope.$watch(function() { return $scope.backdropColor + $scope.backdropOpacity }, function(val) {
			if(!val)
				return;

			$scope.backdropRgba =  'rgba(' +
				parseInt('0x' + val.substr(1,2)) + ',' +
				parseInt('0x' + val.substr(3,2)) + ',' +
				parseInt('0x' + val.substr(5,2)) + ',' +
				$scope.backdropOpacity + ')';

			$('.backdropExample').css('background', $scope.backdropRgba);
		})

		// we were doing this in a timeout, but works just fine without it. so do that instead. Even with a timeout it was getting into a state where the animations weren't happening at all, so not adding the class or adding it so fast it didn't trigger the animation. Watch this.

		setTimeout(function() {
			$('.show-bar, .options, .status').addClass('in');
		})

		var $git = $('.github span');

		$git.hover(function() {
			$git.removeClass('ok cancel');
		})
		$scope.$on('modalOk', function () {
			$git.addClass('ok').removeClass('cancel');
		})
		$scope.$on('modalCancel', function () {
			$git.addClass('cancel').removeClass('ok');
		})

	});// bodyCtrl

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

