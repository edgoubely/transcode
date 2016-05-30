var jwt = require('jsonwebtoken'),
  User = require('../models/user'),
  request = require('request'),
  crypto = require('crypto');

exports.isAuthenticated = function(req, res, next) {
  verifyAuthorizationHeader(req, function(err, user) {
    if (err)
      return res.status(err.code).json(err).end();
    req.user = user;
    next();
  });
};

exports.isAuthenticatedOrGuest = function(req, res, next) {
  verifyAuthorizationHeader(req, function(err, user) {
    if (err)
      return next();
    req.user = user;
    next();
  });
};

function verifyAuthorizationHeader(req, cb) {
  var token = req.headers.authorization;
  var error = {
    code: 401,
    msg: 'Unauthorized'
  };

  if (!token)
    return cb(error);

  token = token.split(' ');

  if (token[0] === 'Bearer' && token[1]) {
    jwt.verify(token[1], req.app.get('secret'), function(err, user) {
      if (err)
        return cb(error);

      cb(null, user);
    });
  } else
    cb(cb(error));
}