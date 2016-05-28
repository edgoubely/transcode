angular
  .module('Transcode')
  .factory('Account', Account);

Account.$inject = [
  '$http',
  '$rootScope',
  'TcConfig'
];

function Account($http, $rootScope, TcConfig) {
  var baseUrl = TcConfig.API + 'user/account/';
  var service = {};

  service.getProfile = function() {
    return $http.get(baseUrl);
  };

  service.updateProfile = function(profileData) {
    return $http.post(baseUrl, profileData);
  };

  service.setUser = function(user) {
    $rootScope.user = user;
    window.localStorage.setItem('user', angular.toJson(user));
  };

  service.deleteAccount = function() {
    return $http.delete(baseUrl);
  };

  return service;
}