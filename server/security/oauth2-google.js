var request = require('request'),
	jwt = require('jsonwebtoken'),
	User = require('../models/user');;

exports.loginWithGoogle = function(req, res) {
  var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
  var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: req.app.get('google-client-secret'),
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Step 1. Exchange authorization code for access token.
  request.post(accessTokenUrl, { json: true, form: params }, function(err, response, token) {
    var accessToken = token.access_token;
    var headers = { Authorization: 'Bearer ' + accessToken };

    // Step 2. Retrieve profile information about the current user.
    request.get({ url: peopleApiUrl, headers: headers, json: true }, function(err, response, profile) {
      if (profile.error) {
        return res.status(500).send({message: profile.error.message});
      }
      // Step 3a. Link user accounts.
      if (req.headers.authorization) {
        User.findOne({ providers: { google: profile.sub } }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Google account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, req.app.get('secret'));
          User.findById(payload.id, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            
            user.providers.google = profile.sub;
            user.profile.picture = user.profile.picture || profile.picture.replace('sz=50', 'sz=200');
            user.profile.name = user.profile.name || profile.name;
            
          	user.saveAndSend(res);
          });
        });
      } else {
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ providers: { google: profile.sub } }, function(err, existingUser) {
          if (existingUser) {
          	// TODO
            return existingUser.saveAndSendWithToken(res);
          }

          var user = new User();
          user.providers.google = profile.sub;
          user.profile.picture = profile.picture.replace('sz=50', 'sz=200');
          user.profile.name = profile.name;
          
        	user.saveAndSendWithToken(res);
        });
      }
    });
  });
}