angular
  .module('Transcode')
  .controller('TaskIndexCtrl', TaskIndexCtrl);

TaskIndexCtrl.$inject = [
  '$scope',
  'TcConfig',
  'toastr',
  'Tasks'
];

function TaskIndexCtrl($scope, TcConfig, toastr, Tasks) {
  Tasks.getUserTasks()
    .then(function(response) {
      $scope.tasks = response.data;
    })
    .catch(function() {
      toastr.error('An error has occured');
    });
}