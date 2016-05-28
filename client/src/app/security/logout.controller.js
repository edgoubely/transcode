angular
  .module('Transcode')
  .controller('LogoutCtrl', LogoutCtrl);

LogoutCtrl.$inject = [
  '$location',
  '$auth',
  '$rootScope',
  'toastr'
];

function LogoutCtrl($location, $auth, $rootScope, toastr) {
  $auth.logout()
    .finally(function() {
      toastr.info('You have been logged out');
      $rootScope.user = {};
      $location.path('/');
    });
}