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

      for (var i = $scope.tasks.length - 1; i >= 0; i--) {
        var tst_date = new Date($scope.tasks[i].source.date);
        console.log(tst_date.toString());
      }
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

angular
  .module('Transcode')
  .filter('elapsed', TcElapsed);

function TcElapsed() {
  return function(strDate) {
    if (!strDate) return;
    var time = Date.parse(strDate),
      timeNow = new Date().getTime(),
      difference = timeNow - time,
      seconds = Math.floor(difference / 1000),
      minutes = Math.floor(seconds / 60),
      hours = Math.floor(minutes / 60),
      days = Math.floor(hours / 24);
    if (days > 1) {
      return days + " days ago";
    } else if (days == 1) {
      return "1 day ago";
    } else if (hours > 1) {
      return hours + " hours ago";
    } else if (hours == 1) {
      return "an hour ago";
    } else if (minutes > 1) {
      return minutes + " minutes ago";
    } else if (minutes == 1) {
      return "a minute ago";
    } else {
      return "a few seconds ago";
    }
  };
}