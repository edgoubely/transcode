angular
  .module('Transcode')
  .controller('PricingCtrl', PricingCtrl);

PricingCtrl.$inject = ['$rootScope', '$scope', '$auth', 'Account'];

function PricingCtrl($rootScope, $scope, $auth, Account) {
  $scope.isAuthenticated = $auth.isAuthenticated;
}