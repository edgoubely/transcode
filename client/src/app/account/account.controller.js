angular
  .module('Transcode')
  .controller('AccountCtrl', AccountCtrl);

AccountCtrl.$inject = [
  '$scope',
  '$auth',
  '$location',
  '$rootScope',
  '$uibModal',
  'toastr',
  'Account'
];

function AccountCtrl($scope, $auth, $location, $rootScope, $uibModal, toastr, Account) {
  $scope.willDeleteAccount = willDeleteAccount;
  $scope.updateProfile = updateProfile;
  $scope.deleteAccount = deleteAccount;
  $scope.getProfile = getProfile;
  $scope.unlink = unlink;
  $scope.link = link;

  activate();

  function activate() {
    $scope.getProfile();
  }

  function getProfile() {
    Account.getProfile()
      .then(function(response) {
        Account.setUser(response.data.user);
      })
      .catch(function(response) {
        toastr.error('An error has occured');
      });
  }

  function updateProfile() {
    Account.updateProfile($rootScope.user)
      .then(function() {
        toastr.success('Profile has been updated');
      })
      .catch(function(response) {
        toastr.error(response.data.message, response.status);
      });
  }

  function link(provider) {
    $auth.link(provider)
      .then(function(response) {
        toastr.success('You have successfully linked a ' + provider + ' account');

        Account.setUser(response.data.user);
        $scope.getProfile();
      })
      .catch(function(response) {
        toastr.error(response.data.message, response.status);
      });
  }

  function unlink(provider) {
    $auth.unlink(provider)
      .then(function(response) {
        if (response.data.user) {
          toastr.info('You have unlinked a ' + provider + ' account');
          Account.setUser(response.data.user);
        } else {
          toastr.success('Account Deleted');
          $auth.logout();
          $location.path('/');
        }
      })
      .catch(function(response) {
        //toastr.error('An error has occurred');
        toastr.error(response.data ? response.data.message : 'Could not unlink ' + provider + ' account', response.status);
      });
  }

  /*
   * Check whether unlinking the account from this provider
   * will delete completly the account.
   */
  function willDeleteAccount(provider) {
    var providers = angular.copy($rootScope.user.providers);
    delete providers[provider];
    return !$rootScope.user.isLocal && _.isEmpty(providers);
  }

  function deleteAccount() {
    Account.deleteAccount()
      .then(function(response) {
        $auth.logout()
          .then(function() {
            $rootScope.user = null;
            $location.path('/');
            toastr.info('Account deleted');
          });
      }, function(response) {
        toastr.error('Cannot delete account');
      });
  }
}