

var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);

app.controller('ctrl', function($scope, $dkModal){
	var $modal, dkModal;

	dkModal = $dkModal({
		//selector: '.selectorModal'
		template: 'mymodal',
		scope: $scope
	})

	$scope.show = function() {

/*
		var obj = dkModal.show();
		obj.modal.on('ok cancel', function(e) {
			console.log(e.type)
		})
*/

		var obj = dkModal.init();
		obj.scope.user = {name: 'carl'};
		obj.modal.off('ok');// if selector, need to clear old one
		obj.modal.on('ok', function() {
			console.log('got it bitch', obj.scope.user)
		})
		obj.modal.on('cancel', function(e) {
			console.log('cancel')
		})
		dkModal.show();


	}

})

app.controller('addCtrl', function($scope) {
	$scope.$parent.$regScope($scope);

	$scope.user = {name: 'dank'}
	$scope.submit = function() {

	}
})

