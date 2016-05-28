angular
  .module('Transcode')
  .controller('SignupCtrl', SignupCtrl);

SignupCtrl.$inject = [
  '$scope',
  '$state',
  '$auth',
  'Account',
  'Tasks',
  'toastr'
];

function SignupCtrl($scope, $state, $auth, Account, Tasks, toastr) {
  $scope.signup = function() {
    var data = $scope.user
    // if user has pending task as guest...
    if (Tasks.currentTask) {
      angular.extend(data, {
          task_id: Tasks.currentTask.id
      });
    }

    $auth.signup(data)
      .then(function(response) {
        toastr.info('You have successfully created a new account and have been signed-in');

        Account.setUser(response.data.user);
        $auth.setToken(response.data.token);
        $state.go('home');
      })
      .catch(function(response) {
        toastr.error('An error has occurred');
      });
  };
}