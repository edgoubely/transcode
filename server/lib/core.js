var request = require('request'),
  path = require('path');

function Core(opts) {
  this.url = opts.url;
}

Core.prototype.pushJob = function(task, cb) {
  var params = {
    command: task.command,
    fromFile: path.join(task.source.path, task.source.filename),
    toFile: task.source.filename + '.' + task.target.format
  };
  
  var url = 'http://' + this.url + '/jobs';

  request.post({
    url: url,
    qs: params
  }, function(err, response, body) {
    if (err) {
      console.error(err);
    }

    console.log(body);
    cb(err, JSON.parse(body).job.id);
  });
};

Core.prototype.getStatus = function(jobId, cb) {
  request.get({
    url: this.url,
    qs: {
      id: jobId
    }
  }, function(err, response, status) {
    cb(err, status);
  })
};

Core.prototype.sendMail = function(param, cb) {
  setTimeout(function() {
    cb();
  }, 1);
};

module.exports = new Core({
  url: process.env.CORE_URL
});