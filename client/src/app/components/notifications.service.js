angular
  .module('Transcode')
  .factory('TcNotifs', TcNotifs);

TcNotifs.$inject = [
  '$auth',
  '$q',
  'TcConfig',
  'toastr',
  '$state'
];

function TcNotifs($auth, $q, TcConfig, toastr, $state) {
  var service = {};

  service.socket = {};

  service.connect = function() {
    var token = $auth.getToken();
    service.socket = io.connect(TcConfig.API, {'forceNew': true});

    service.socket.on('connect', function() {
      service.socket.emit('authenticate', token);
    });

    service.socket.on('authenticated', function(authenticated) {
      if (!authenticated)  {
        $auth.logout();
        service.socket.disconnect();
      }
    });

    service.socket.on('task_update', function(update) {
      toastr.info('A task has been updated!');
    });

    service.socket.on('error', function() {
      $auth.logout();
      service.socket.disconnect();
      $state.go('home');
    });
  };

  service.on = function(eventName, callback) {
    service.socket.on(eventName, callback);
  };

  service.error = function(msg) {
    if (!msg) {
      msg = 'Ops! An error has occured...';
    }
    toastr.error(msg);
  };

  return service;
}
