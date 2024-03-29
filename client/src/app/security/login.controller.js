angular
  .module('Transcode')
  .controller('LoginCtrl', LoginCtrl);

LoginCtrl.$inject = [
  '$scope',
  '$location',
  '$auth',
  'toastr',
  'Account',
  'TcNotifs'
];

function LoginCtrl($scope, $location, $auth, toastr, Account, TcNotifs) {
  $scope.login = function() {
    $auth.login($scope.user)
      .then(function(response) {
        toastr.success('You have successfully signed in!');
        TcNotifs.connect();
        Account.setUser(response.data.user);

        $location.path('/');
      })
      .catch(function(error) {
        toastr.error(error.data ? error.data : 'An error has occured...');
      });
  };
  $scope.authenticate = function(provider) {
    $auth.authenticate(provider)
      .then(function(response) {
        toastr.success('You have successfully signed in with ' + provider + '!');

        Account.setUser(response.data.user);

        $location.path('/');
      })
      .catch(function(error) {
        if (error.error) {
          // Popup error - invalid redirect_uri, pressed cancel button, etc.
          toastr.error(error.error);
        } else if (error.data) {
          // HTTP response error from server
          toastr.error(error.data.message, error.status);
        } else {
          toastr.error(error);
        }
      });
  };
}