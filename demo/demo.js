(function () {
	'use strict';

	var log = console.log.bind(console);
	//var log = console.log = function(){} //todo-prod: reverse these log line comments

/*
	$('.target').click(function() {
		$(this).css('background', 'red')
	})
*/


	// draggable target
/*
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
				$(document).off('mouseup mousemove');
			})

			return false;
		}
	})
*/


	$('.target').draggable();


	var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);


	app.config(function (dkModalProvider) {
		dkModalProvider.setDefaults({
			//backdropColor: 'rgba(0,0,255,.2)'
		})

	})

	app.controller('bodyCtrl', function ($scope, $timeout, dkModal) {

		$scope.defBody = '<p>This modal uses the dk-modal default template, which allows you to specify a data-bound header/body and footer mode. Header, footer, close icon are optional.';

		var defHeader = $scope.defHeader = 'Default Modal';

		$scope.selectorModalBody = "This modal is a dom element on the page. It's accessed with a jquery selector. Default positioning: modal centered in viewport with width at set % based on breakpoint.";

		$scope.templateModalBody = "This modal is loaded from html file, then compiled/linked against the chosen scope. It has an input element, so will be positioned near top of screen for mobile phone.";

		$scope.qrcodeBody = "<img src='qrcode.png' width='148' height=148>";

		window.$scope = $scope;//todo: remove

		// defaults
		$scope.position = 'default';
		$scope.showHeader = true;

		var opts = $scope.opts = {
			key: true,
			click: true,
			scope: $scope,
			targetSide: 'right',
			targetVert: 'middle',
			defaultClose: true,
			defaultFooter: 'ok',
			test: {
				mode: navigator.userAgent.indexOf('Mobi') === -1? 'desktop': 'mobile'
			}
		};

		$scope.showDefault = function () {
			dkModal($.extend({}, opts, {
				templateUrl: 'dkModalTemplate.html',
				defaultHeader: 'defHeader',
				defaultBody: 'defBody'
			})).show('init');
		}

		$scope.showSelector = function () {
			dkModal($.extend({}, opts, {selector: '.selModal'})).show('init');
		}

		$scope.showTemplateUrl = function () {
			var temp_dkModal = dkModal($.extend({}, opts, {templateUrl: 'tempModal.html'}));
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

		$timeout(function() {
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

