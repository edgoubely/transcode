angular
  .module('Transcode')
  .controller('TaskCreationCtrl', TaskCreationCtrl);

TaskCreationCtrl.$inject = [
  '$scope',
  'TcConfig',
  'toastr',
  'Tasks',
  '$state',
  '$auth'
];

function TaskCreationCtrl($scope, TcConfig, toastr, Tasks, $state, $auth) {
  $scope.isFileUploaded = false;
  $scope.isFileSelected = false;
  $scope.videoURL = '';

  // TODO: from api
  $scope.availableCommands = [{
    code: 'convert',
    descr: 'Convert'
  }, {
    code: 'extract',
    descr: 'Extract audio'
  }, ];

  $scope.availableFormats = [{
    ext: 'avi',
    name: 'Audio Video Interleave'
  }, {
    ext: 'mp4',
    name: 'MPEG-4 Part 14'
  }, {
    ext: 'mkv',
    name: 'Matroska file'
  }, {
    ext: 'mpeg',
    name: 'Moving Pictures Experts Group'
  }];

  $scope.createTaskFromURL = createTaskFromURL;
  $scope.sendFile = createTaskFromFile;
  $scope.submitTask = submitTask;
  $scope.currentTask = Tasks.currentTask;
  $scope.abortTaskCreation = abortTaskCreation;

  $scope.$watch(function() {
    return $scope.videoURL;
  }, function() {
    if ($scope.videoURL && $scope.urlForm.videoURL.$valid) {
      $scope.createTaskFromURL($scope.videoURL);
    }
  });

  function createTaskFromURL(url) {
    Tasks.createNewTaskFromURL(url).then(
      function() {
        $scope.isFileUploaded = true;
        $scope.currentTask = Tasks.currentTask;
        toastr.info('Upload completed');
      },
      function(error) {
        toastr.error(error);
      });
  }

  function createTaskFromFile(file) {
    $scope.isFileSelected = true;
    Tasks.createNewTaskFromFile(file).then(
      function() {
        $scope.isFileUploaded = true;
        $scope.currentTask = Tasks.currentTask;
        toastr.info('Upload completed');
      },
      function(error) {
        toastr.error(error.data);
      },
      function(progress) {
        $scope.progress = progress;
      });
  }

  function abortTaskCreation() {
    Tasks.removeLocalTask();
    delete Tasks.currentTask;
    delete $scope.currentTask;
    $state.go('home');
  }

  function submitTask() {
    angular.extend(Tasks.currentTask, {
      command: $scope.command.code,
      targetFormat: $scope.format.ext
    });
    Tasks.validateCurrentTask()
      .then(function() {
        toastr.info('Task submitted');
        if ($auth.isAuthenticated()) {
          $state.go('tasks');
        } else {
          toastr.warning('You must signup to get your result'); // TODO: make persistent
          $state.go('signup');
        }
      })
      .catch(function(response) {
        toastr.error('An error has occured');
      });
  }
}