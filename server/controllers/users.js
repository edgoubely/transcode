var User = require('../models/user'),
  Task = require('../models/task'),
  Core = require('../lib/core'),
  async = require('async'),
  jwt = require('jsonwebtoken');


/**
 * POST /auth/signup
 * Register a new user account.
 */
exports.signup = function(req, res, next) {
  req.assert('email', 'Invalid email').isEmail();
  req.assert('password', 'Invalid password').notEmpty();

  if (req.validationErrors())
    return res.status(403).json(req.validationErrors());

  async.waterfall([
    checkEmail,
    createUser,
    linkGuestTask,
    saveAndAuthenticateUser
  ], function(err, token, user) {
    if (err) {
      return next(err);
    }
    res.json({
      token: token,
      user: user.getAccountInfos()
    });
  });

  function checkEmail(done) {
    User.findOne({
      email: req.body.email
    }, done);
  }

  function createUser(existingUser, done) {
    if (existingUser)  {
      return res.status(409).json({
        message: 'This email adresse is already in use'
      });
    }
    var user = new User({
      email: req.body.email,
      password: req.body.password,
      profile: {
        name: req.body.name
      },
      isLocalAccount: true
    });
    user.save(function(err, user) {
      done(err, user);
    });
  }

  function linkGuestTask(user, done) {
    if (req.body.task_id) {
      Task.findById(req.body.task_id, function(err, task) {
        if (task.user) {
          return res.status(500).json({
            msg: 'Task already linked'
          });
        }
        task.user = user.id;
        task.status = 'submitted';
        task.save(function(err) {
          done(err, user);
        });
      });
    } else {
      console.log(done);
      done(null, user);
    }
  }

  function saveAndAuthenticateUser(user, done) {
    user.save(function(err, user) {
      if (err)
        return done(err);
      var payload = {
        id: user._id
      };
      var opts = {
        expiresIn: req.app.get('token_expires')
      };

      jwt.sign(payload, req.app.get('secret'), opts, function(token) {
        done(null, token, user);
      });
    });
  }
};

/**
 * POST /auth/signin
 * Authenticate user, send back authorization token.
 */
exports.signin = function(req, res, next) {
  req.assert('email', 'Invalid email').isEmail();
  req.assert('password', 'Password must not be empty').notEmpty();

  var errors = req.validationErrors();

  if (errors)
    res.status(403).json(errors);


  User.findOne({
    email: req.body.email
  }, function(err, user) {
    if (err)
      return next(err);

    if (!user)
      return res.status(401).end('Unknown email address');

    user.comparePassword(req.body.password, function(err, isMatch) {
      if (err)
        return next(err);

      if (!isMatch) {
        return res.status(401).end('Incorrect password');
      } else {
        var payload = {
          id: user._id
        };

        jwt.sign(payload, req.app.get('secret'), {
          expiresIn: req.app.get('token_expires')
        }, function(token) {
          res.json({
            token: token,
            user: user.getAccountInfos()
          });
          next();
        });
      }
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = function(req, res) {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({
      resetPasswordToken: req.params.token
    })
    .where('resetPasswordExpires').gt(Date.now())
    .exec(function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        res.status(404).json({
          msg: 'Password reset token is invalid or has expired.'
        });
      }
      //TODO
      res.end();
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = function(req, res, next) {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  var errors = req.validationErrors();

  if (errors) {
    res.status(403).json(errors);
  }

  async.waterfall([
    function(done) {
      User
        .findOne({
          resetPasswordToken: req.params.token
        })
        .where('resetPasswordExpires').gt(Date.now())
        .exec(function(err, user) {
          if (err)
            return next(err);

          if (!user) {
            res.status(403).json({
              msg: 'Password reset token is invalid or has expired.'
            });
          }
          user.password = req.body.password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
          user.save(function(err) {
            if (err)
              return next(err);
            req.logIn(user, function(err) {
              done(err, user);
            });
          });
        });
    },
    function(user, done) {
      var mailOptions = {
        to: user.email,
        from: 'noreply@transcode.com',
        subject: 'Your Transcode password has been changed',
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };

      Core.sendMail(mailOptions, function() {
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err)
      return next(err);
    res.end();
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = function(req, res, next) {
  req.assert('email', 'Please enter a valid email address.').isEmail();

  var errors = req.validationErrors();

  if (errors) {
    res.status(403).json(errors);
  }

  async.waterfall([
    function(done) {
      crypto.randomBytes(16, function(err, buf) {
        var token = buf.toString('hex');
        done(err, token);
      });
    },
    function(token, done) {
      User.findOne({
        email: req.body.email.toLowerCase()
      }, function(err, user) {
        if (!user) {
          res.status(404).json({
            msg: 'No account with that email address exists.'
          });
        }
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        user.save(function(err) {
          done(err, token, user);
        });
      });
    },
    function(token, user, done) {
      var mailOptions = {
        to: user.email,
        from: 'noreply@transcode.com',
        subject: 'Reset your Transcode account password',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      Core.sendMail(mailOptions, function() {
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err)
      return next(err);
    res.end();
  });
};