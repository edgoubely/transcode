angular
  .module('Transcode')
  .controller('ContactCtrl', ContactCtrl);

ContactCtrl.$inject = ['$scope', '$http', 'TcConfig', 'toastr', '$state'];

function ContactCtrl($scope, $http, TcConfig, toastr, $state) {
  $scope.send = send;

  function send() {
    var url = TcConfig.API + 'contact';

    $http.post(url, $scope.contact).then(
      function() {
        toastr.info('Your message has been sent.');
        $state.go('home')
      },
      function(response) {
        toastr.error('An error has occured.');
      });
  }
}