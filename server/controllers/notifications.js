var ipn = require('paypal-ipn'),
  User = require('../models/user'),
  Core = require('../lib/core'),
  Task = require('../models/task');

/**
 * POST /task/{id}
 * Get notified when the core has finished or started a job for a task.
 */
exports.updateTaskStatus = function(io) {
  return function(req, res, next) {
    req.assert('job_id').notEmpty();
    req.assert('status').notEmpty();

    if (req.validationErrors())
      return res.status(403).json(req.validationErrors());

    // TODO: replace task id by job id (we keep task id for the tests)
    Task.findById({
      _id: req.body.job_id
    }, function(err, task) {
      if (err)
        return next(err);
      task.status = req.body.status;
      task.save(function(err) {
        if (err)
          return next(err);
        
        // if the client is connected, notify him
        if (io.clients[task.user]) {
          // this not the native 'clients' property of the socketio object,
          // but a custom one, so no risk of breaking 

          io.server.to(io.clients[task.user]).emit('task_update', {
            task_id: task._id,
            new_status: task.status
          });
        }
        res.status(200).end();
      });
    });
  };
};

/**
 * POST /notifications/ipn
 * Get notified when a paypal transaction is completed.
 */
exports.ipn = function(io) {
  return function(req, res, next) {
    var paymentStatus = req.body.payment_status;
    var subscriptionPlan = req.body.item_name; 
    var userId = req.body.custom;
    var opts = {};

    if (process.env !== 'production') {
      opts['allow_sandbox'] = true;
    }
    res.status(200)
    res.end('OK');

    ipn.verify(req.body, opts, function callback(err, mes) {
      // just ignore errors for now
      if (!err && userId) {
        if (paymentStatus === 'Completed') {
          User.findById(userId, function(err, user) {
            if (err)
              return;
            if (subscriptionPlan == 'On-demand Task Token') {
              user.subscriptionPlan = 1; // TODO
            } else if (subscriptionPlan == 'Zen') {
              user.subscriptionPlan = 2; // TODO
            }
            // TODO: find pending tasks and update their status
            // TODO: send the taks to the Core
            // TODO: notify user
          });
        }
      }
    });
  };
};