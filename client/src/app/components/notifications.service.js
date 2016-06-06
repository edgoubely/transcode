angular
  .module('Transcode')
  .factory('TcNotifs', TcNotifs);

TcNotifs.$inject = [
  '$auth',
  '$q',
  'TcConfig',
  'toastr'
];

function TcNotifs($auth, $q, TcConfig, toastr) {
  var service = {};

  service.socket = {};

  service.connect = function() {
    var token = $auth.getToken();
    service.socket = io.connect(TcConfig.API);

    service.socket.on('connect', function() {
      service.socket.emit('authenticate', token);
    });

    service.socket.on('authenticated', function(authenticated) {
      if (authenticated)  {
        toastr.info('Socket connected');
      }
    });

    service.socket.on('task_update', function(update) {
      toastr.info('A task has been updated!');
    });
  };

  service.on = function(eventName, callback) {
    service.socket.on(eventName, callback);
  };

  service.error = function() {
    toastr.error('Ops! An error has occured...');
  };

  return service;
}