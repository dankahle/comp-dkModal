

var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);

app.controller('ctrl', function($scope, $dkModal){
	var $modal, dkModal;

	/*
	 target: undefined, // jquery object
	 selector: undefined,
	 template: undefined,
	 key: true,
	 click: true,
	 targetVert: 'middle', // top/middle/bottom
	 targetSide: 'right', // left/right
	 targetLeft: false,
	 offsetTop: undefined, // integer
	 offsetLeft: undefined, // integer
	 separation: 20, // integer, distance left or right of target
	 width: undefined, // string with px or %
	 backdropColor: undefined // rgba(0,0,0,.2), must be rgba otherwise won't be transparent

	 */



	dkModal = $dkModal({
		//selector: '.selectorModal'
		template: 'mymodal',
		scope: $scope,
		target: '.one',
		targetSide: 'right',
		//width: '400px',
		targetVert: 'middle',
		//offsetTop: "9%",
		//offsetLeft: "50%"
	})

	$scope.show = function() {

/*
		var obj = dkModal.show();
		obj.modal.on('ok cancel', function(e) {
			console.log(e.type)
		})
*/

		//var obj = dkModal.init();
		//obj.scope.user = {name: 'carl'};
		var obj = dkModal.show();
		obj.modal.off('ok');// if selector, need to clear old one
		obj.modal.on('ok', function() {
			console.log('got it:', obj.scope.user)
		})
		obj.modal.on('cancel', function(e) {
			console.log('cancel')
		})


	}

})

app.controller('addCtrl', function($scope) {
	$scope.$parent.$regScope($scope);

	$scope.user = {name: 'dank'}
	$scope.submit = function() {

	}
})

