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
 * Send the user's tasks.
 */
exports.index = function(req, res, next) {
  Task.find({
    user: req.user.id
  }, function(err, tasks) {
    if (err)
      return next(err);
    res.json(tasks);
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
      task.purpose = req.body.command;
      task.target.format = req.body.format;
      //TODO: compute cost
      if (task.user) {
        // if the user has not paid or reach the max number of free tasks 
        if (!task.user.subscriptionPlan && task.user.taskSubmissions >= 5) {
          done(task, 'waiting_for_payment');
        } else {
          Core.pushJob(task, function(err, jobId) {
            done(task, 'submitted');
          });
        }
      } else {
        done(task, 'waiting_for_registration');
      }

      function done(task, status) {
        task.status = status;
        task.save(function(err, task) {
          if (err) {
            console.log(err);
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

  if (req.user)
    task.user = req.user.id;

  var destName = fileUID(task.user);
  var destPath = path.join(req.app.get('videos-base-directory'), req.user ? req.user.id : 'temp');

  task.source.displayName = req.body.video_url;
  task.source.filename = destName;
  task.source.path = destPath;

  mkdirp(destPath, function(err) {
    var dest = fs.createWriteStream(path.join(destPath, destName));

    dest.on('finish', function(data) {
      probe(path.join(destPath, destName), function(err, probeData) {
        task.source.infos = JSON.stringify(probeData);

        task.save(function(err) {
          var resContent = {
            task_id: task._id,
            source: task.source
          };

          res.status(200).json(resContent);
        });
      });
    });
    // TODO: check response content type
    videoRequest.pipe(dest);
  });
};

/**
 * POST /tasks/file
 * Download the file, create a new task with the downloaded file as source 
 * then send back the task ID and infos.
 */
exports.fromFile = function(req, res, next) {
  var busboy = new Busboy({
    headers: req.headers
  });
  
  var task = new Task();

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
    if (req.user)
      task.user = req.user.id;

    var destName = fileUID(task.user);
    var destPath = path.join(req.app.get('videos-base-directory'), req.user ? req.user.id : 'temp');

    task.source.displayName = filename;
    task.source.filename = destName;
    task.source.path = destPath;

    mkdirp(destPath, function(err) {
      var dest = fs.createWriteStream(path.join(destPath, destName));

      file.pipe(dest);
    });
  });

  busboy.on('finish', function() {
    probe(path.join(task.source.path, task.source.filename), function(err, probeData) {
      task.source.infos = JSON.stringify(probeData);

      task.save(function(err, task) {
        var resContent = {
          task_id: task._id,
          source: task.source
        };

        res.status(200).json(resContent);
      });
    });
  });

  req.pipe(busboy);
};

function fileUID(owner) {
  var filename = crypto.pseudoRandomBytes(10).toString('hex');
  if (owner) filename += '-' + owner;
  filename += '-' + moment().format('YYYYMMDDhhmmss');
  return filename;
}