

var app = angular.module('app', ['ngAnimate', 'ngTouch', 'dkModal']);

app.controller('ctrl', function($scope, $dkModal, util){
	util.registerScope('ctrl', $scope);

	var $modal, dkModal;

	dkModal = $dkModal({
		selector: '#mymodal'
	})

	$scope.show = function() {
		$modal = dkModal.show();
		$modal.off('ok');
		$modal.on('ok', function() {
			var user = getScope('addCtrl').user;
			console.log('got it bitch', user)
		})
	}

})

app.controller('addCtrl', function($scope, util) {
	util.registerScope('addCtrl', $scope);

	$scope.user = {name: 'dank'}
	$scope.submit = function() {

	}
})

app.factory('util', function($rootScope) {
	var get = {},
		scopes = [];
	get.registerScope = function(name, scope) {
		scope.$regName = name; // for a debugging aid as the $id is ambiguous
		scopes.push({name: name, scope: scope});
	}

	get.getScope = function(name) {
		var scope;
		scopes.filter(function(v) {
			if(v.name.toLowerCase().trim() == name.toLowerCase().trim())
				scope = v.scope;
		})
		return scope;
	}

	get.registerScope('root', $rootScope);

	window.getScope = get.getScope;

	return get;
});
