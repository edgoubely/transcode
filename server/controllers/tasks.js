var
  User = require('../models/user'),
  Task = require('../models/task'),
  Core = require('../lib/core'),
  probe = require('node-ffprobe'),
  request = require('request'),
  Busboy = require('busboy'),
  moment = require('moment'),
  crypto = require('crypto'),
  mkdirp = require('mkdirp'),
  async = require('async'),
  path = require('path'),
  fs = require('fs');

/**
 * GET /tasks
 * Retrieve the user's tasks.
 */
exports.index = function(req, res, next) {
  Task.find({ user: req.user.id })
    .limit(15)
    .sort({ submissionDate: -1 })
    .exec(function(err, tasks) {
      if (err)
        return next(err);
      res.json(tasks);
    });
};

/**
 * GET /tasks/{id}/result
 * Download the task result
 */
 exports.downloadTaskResult = function(req, res, next) {
  Task.findById(req.params.id, function(err, task) {
    if (err) {
      return next(err);
    }
    var resultLocation = path.join(req.app.get('video'), task.user, task.target.filename );
    resultLocation += '.' + task.target.format;

    fs.exists(resultLocation, function(exists) {
      if (!exists) {
        return res.status(404).end();
      }
      var file = fs.createReadStream(resultLocation);
      file.pipe(res);
    });
  });
 };

/**
 * DELETE /tasks/{id}
 * Delete task result file
 */
exports.deleteTaskResult = function(req, res, next) {
  req.assert('task_id').notEmpty();

  if (req.validationErrors())
    return res.status(403).json(req.validationErrors());

  Task.findById({
    _id: req.body.task_id
  }, function(err, task) {
    if (err)
      return next(err);

    if (task.target.filename) {
      fs.unlink(path.join(req.app.get('videos-base-directory'), task.target.filename), function(err) {
        if (err)
          return next(err);
        delete task.target.filename;
        task.save(function(err) {
          res.status(200).end();
        });
      });
    }
  });
};

/**
 * POST /tasks
 * Complete a task construction and submit it to the Core if authorized.
 */
exports.submitTask = function(req, res, next) {
  req.assert('command').notEmpty(); //TODO
  req.assert('format').notEmpty(); //TODO
  req.assert('task_id').notEmpty(); //TODO

  if (req.validationErrors())
    return res.status(403).json(req.validationErrors());

  Task.findById(req.body.task_id)
    .populate('user')
    .exec(function(err, task) {
      task.command = req.body.command;
      task.submissionDate = new Date();
      task.target.format = req.body.format;
      //TODO: compute cost
      if (task.user) {
        // if the user has not paid or reach the max number of free tasks 
        if (!task.user.subscriptionPlan && task.user.taskSubmissions >= 5) {
          done(task, 'waiting_for_payment');
        } else {
          task.user.taskSubmissions++;
          task.user.save(function(err) {
            Core.pushJob(task, function(err, jobId) {
              task.job = jobId;
              done(task, 'queued');
            });
          });
        }
      } else {
        done(task, 'waiting_for_registration');
      }

      function done(task, status) {
        task.status = status;
        task.save(function(err, task) {
          if (err) {
            return next(err);
          }
          res.status(200);
          res.json({
            status: task.status
          });
        });
      }
    });
};

/**
 * POST /tasks/url
 * Download a file from a URL, create a new task with the downloaded file as source 
 * then send back the task ID and infos.
 */
exports.fromURL = function(req, res, next) {
  req.assert('video_url', 'Please give a valid URL').isURL();

  if (req.validationErrors())
    return res.status(403).json(req.validationErrors());

  var videoRequest = request.get(req.body.video_url);
  var task = new Task();

  initTask(req, task, function(err, stream) {
    stream.on('finish', function(data) {
      task.name = req.body.video_url;
      probeSourceAndSaveTask(task, res);
    });
    // TODO: check response content type
    videoRequest.pipe(stream);
  });
};

/**
 * POST /tasks/file
 * Download the file, create a new task with the downloaded file as source 
 * then send back the task ID and infos.
 */
exports.fromFile = function(req, res, next) {
  var task = new Task();
  var busboy = new Busboy({
    headers: req.headers
  });

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    initTask(req, task, function(err, stream) {
      task.name = filename;
      file.pipe(stream);
    });
  });

  busboy.on('finish', function() {
    probeSourceAndSaveTask(task, res);
  });

  req.pipe(busboy);
};

/**
 * Make the source filename and path for the task.
 */
function initTask(req, task, cb) {
  var destName = fileUID(task.user);
  var destPath = path.join(req.app.get('videos-base-directory'), req.user ? req.user.id : 'temp');

  if (req.user)  {
    task.user = req.user.id;
  }
  task.source.filename = destName;
  task.source.path = destPath;
  mkdirp(destPath, function(err) {
    cb(err, fs.createWriteStream(path.join(destPath, destName)));
  });
}

/**
 * Retrieve source file infos, add them to the task then send the result.
 */
function probeSourceAndSaveTask(task, res) {
  probe(path.join(task.source.path, task.source.filename), function(err, probeData) {
    task.source.infos = JSON.stringify(probeData);
    task.status = 'waiting_for_command';
    task.save(function(err, task) {
      res.status(200);
      res.json({
        task_id: task._id,
        source: task.source,
        name: task.name
      });
    });
  });
}

/**
 * Create a unique file ID for the source.
 */
function fileUID(owner) {
  var filename = crypto.pseudoRandomBytes(10).toString('hex');
  if (owner) filename += '-' + owner;
  filename += '-' + moment().format('YYYYMMDDhhmmss');
  return filename;
}