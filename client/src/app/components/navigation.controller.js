angular
  .module('Transcode')
  .controller('NavbarCtrl', NavbarCtrl);

NavbarCtrl.$inject = ['$scope', '$auth'];

function NavbarCtrl($scope, $auth) {

  $scope.isAuthenticated = function() {
    return $auth.isAuthenticated();
  };
}