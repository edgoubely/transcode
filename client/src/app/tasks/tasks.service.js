angular
  .module('Transcode')
  .factory('Tasks', Tasks);

Tasks.$inject = [
  '$http',
  '$rootScope',
  '$q',
  'TcConfig',
  'Upload'
];

function Tasks($http, $rootScope, $q, TcConfig, Upload) {
  var baseUrl = TcConfig.API + 'task/';
  var service = {};

  service.getUserTasks = function() {
    return $http.get(baseUrl);
  };

  service.createNewTaskFromFile = function(file) {
    var deferred = $q.defer();

    Upload.upload({
      url: baseUrl + 'file',
      file: file
    }).then(
      function(response) {
        initTask(response);
        deferred.resolve();
      },
      function(error) {
        deferred.reject(error);
      },
      function(update) {
        deferred.notify(Math.min(100, parseInt(100.0 * update.loaded / update.total)));
      });

    return deferred.promise;
  };

  service.createNewTaskFromURL = function(url) {
    var deferred = $q.defer();

    $http.post(baseUrl + 'url', {
      video_url: url
    }).then(
      function(response) {
        initTask(response);
        deferred.resolve();
      },
      function(error) {
        deferred.reject(error);
      });

    return deferred.promise;
  };

  service.validateCurrentTask = function() {
    var deferred = $q.defer();

    $http.put(baseUrl, {
      task_id: this.currentTask.id,
      format: this.currentTask.targetFormat,
      command: this.currentTask.command
    }).then(
      function(response) {
        service.currentTask.status = response.data.status;
        service.removeLocalTask();
        deferred.resolve();
      },
      function(error) {
        deferred.reject(error);
      });
    return deferred.promise;
  };

  service.removeLocalTask = function() {
    localStorage.removeItem('current_task');
  };

  service.saveCurrentTask = function() {
    localStorage.setItem('current_task', angular.toJson(this.currentTask));
  };

  service.getCurrentTask = function() {
    this.currentTask = angular.fromJson(localStorage.getItem('current_task'));
  };

  function initTask(response) {
    service.currentTask = {
      id: response.data.task_id,
      source: response.data.source
    };
    service.currentTask.source.infos = angular.fromJson(service.currentTask.source.infos);
    service.saveCurrentTask();
  }

  return service;
}