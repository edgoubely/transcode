angular
  .module('Transcode')
  .controller('TaskIndexCtrl', TaskIndexCtrl);

TaskIndexCtrl.$inject = [
  '$scope',
  'TcConfig',
  'Tasks',
  'TcNotifs'
];

function TaskIndexCtrl($scope, TcConfig, Tasks, TcNotifs) {
  $scope.tasks = [];

  Tasks.getUserTasks()
    .then(function(response) {
      $scope.tasks = response.data;
    })
    .catch(function() {
      TcNotifs.error();
    });

  TcNotifs.on('task_update', function(update) {
    for (var i = $scope.tasks.length - 1; i >= 0; i--) {
      if ($scope.tasks[i]._id === update.task_id) {
        $scope.tasks[i].status = update.new_status;    
      }
    }
  });
}