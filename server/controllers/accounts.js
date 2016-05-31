var User = require('../models/user'),
  Task = require('../models/task'),
  async = require('async'),
  path = require('path'),
  fs = require('fs');

/**
 * GET /user/account
 * Retrieve user account infos.
 */
exports.getAccount = function(req, res, next) {
  User.findById(req.user.id, function(err, user) {
    if (err || !user)
      return res.status(404).json({
        message: 'User not found'
      });

    res.json({
      user: user.getAccountInfos()
    });
  });
};

/**
 * POST /user/account
 * Update user account.
 */
exports.updateAccount = function(req, res, next) {
  //TODO: req validation
  User.findById(req.user.id, function(err, user) {
    if (err)
      return next(err);

    if (!user)
      return res.status(404).json({
        message: 'User not found'
      });

    user.profile.name = req.body.name && req.body.name.length > 2 ? req.body.name : user.profile.name;
    user.updated = Date.now();

    user.save(function(err) {
      if (err)
        next(err);

      res.status(200).end();
    });
  });
};

/**
 * POST /auth/unlink
 * Unlink user account from a social account.
 */
exports.unlink = function(req, res) {
  var provider = req.body.provider;
  var providers = ['facebook', 'foursquare', 'google'];

  if (providers.indexOf(provider) === -1) {
    return res.status(400).send({
      message: 'Unknown OAuth Provider'
    });
  }

  User.findById(req.user.id, function(err, user) {
    if (err)
      return next(err);

    user.providers[provider] = undefined;

    // If no local account exists, 
    // checks if there are other providers
    // if not then delete the account
    if (!user.isLocal) {
      var i = 0;
      var hasProvider = false;

      while (providers[i]) {
        if (user.providers[providers[i]]) {
          hasProvider = true;
          break;
        }
        i++;
      }

      if (!hasProvider) {
        //TODO: delete tasks and files
        return User.remove({
          _id: user._id
        }, function()  {
          res.json({
            message: 'Account deleted'
          });
        });
      }

      // Account is not local
      // but has another provider
      return user.save(function(err, user) {
        res.json({
          user: user.getAccountInfos()
        });
      });
    }

    // Else, just save and return the updated user
    user.save(function(err, user) {
      res.json({
        user: user.getAccountInfos()
      });
    });
  });
};

/**
 * DELETE /user/account
 * Delete the user account permanently.
 */
exports.deleteAccount = function(req, res, next) {
  var userTaskDir = path.join(req.app.get('videos-base-directory'), req.user.id);

  Task.remove({
    user: req.user.id
  }, function(err) {
    if (err)
      return next(err);

    removeDirRecursively(userTaskDir, function(err) {
      if (err)
        return next(err);

      User.remove({
        _id: req.user.id
      }, function(err) {
        if (err)
          return next(err);
        res.end();
      });
    });
  });
};

function removeDirRecursively(location, next) {
  fs.exists(location, function(exists) {
    if (exists) {
      fs.readdir(location, function(err, files) {
        async.each(files, function(file, cb) {
          file = path.join(location, file);
          fs.stat(file, function(err, stat) {
            if (err)
              return cb(err);
            if (stat.isDirectory()) {
              removeDirRecursively(file, cb);
            } else {
              fs.unlink(file, function(err) {
                if (err)
                  return cb(err);
                return cb();
              });
            }
          });
        }, function(err) {
          if (err)
            return next(err);
          fs.rmdir(location, function(err) {
            return next(err);
          });
        });
      });
    } else {
      next();
    }
  });
}