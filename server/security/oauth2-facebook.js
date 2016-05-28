var request = require('request'),
	jwt = require('jsonwebtoken'),
	User = require('../models/user');;

exports.loginWithFacebook = function(req, res, next) {
  var fields = ['id', 'email', 'first_name', 'last_name', 'link', 'name'];
  var accessTokenUrl = 'https://graph.facebook.com/v2.5/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.5/me?fields=' + fields.join(',');
  var params = {
    code: req.body.code,
    client_id: req.app.get('fb-client-id'),
    client_secret: req.app.get('fb-client-secret'),
    redirect_uri: req.body.redirectUri
  };

  // Step 1. Exchange authorization code for access token.
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: accessToken, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }

      if (req.headers.authorization) {
        User.findOne({ providers: { facebook: profile.id } }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
          }

          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, req.app.get('secret'));

          User.findById(payload.id, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }

            user.providers.facebook = profile.id;
            user.profile.picture = user.profile.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
            user.profile.name = user.profile.name || profile.name;
            user.saveAndSend(res);
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ providers: { facebook: profile.id } }, function(err, existingUser) {
          if (existingUser) {
            return existingUser.saveAndSendWithToken(res);
          }

          var user = new User();
          user.providers.facebook = profile.id;
          user.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.profile.name = profile.name;
          user.saveAndSendWithToken(res);
        });
      }
    });
  });
}