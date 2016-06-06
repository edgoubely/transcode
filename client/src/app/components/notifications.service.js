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

  service.connect = function() {
    var token = $auth.getToken();
    var socket = io.connect(TcConfig.API);

    socket.on('connect', function() {
      toastr.info('Socket connected');
      socket.emit('authenticate', token);
    });

    socket.on('disconnect', function() {
      toastr.warning('Socket disconnected');
    });

    socket.on('authenticated', function(authenticated) {
      if (authenticated)  {
        toastr.info('Socket authenticated');
      }
    });
  };

  return service;
}