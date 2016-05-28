var request = require('request'),
  path = require('path');

function Core(opts) {
  this.url = opts.url;
}

Core.prototype.pushJob = function(task, cb) {
  var params = {
    command: task.purpose,
    format: task.target.format,
    file: path.join(task.source.path, task.source.filename)
  };
  
  request.get({
    url: this.url,
    qs: params
  }, function(err, response, jobId) {
    cb(err, jobId);
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