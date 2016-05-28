var Core = require('../lib/core');

/**
 * POST /contact
 * Send a contact form via Nodemailer.
 */
exports.postContact = function(req, res, next) {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('message', 'Message cannot be blank').notEmpty();

  var errors = req.validationErrors();

  if (errors)
    return res.status(403).json(errors);

  var from = req.body.email;
  var name = req.body.name;
  var body = req.body.message;
  var to = process.env.CONTACT_EMAIL;
  var subject = 'Contact Form | Transcode';

  var mailOptions = {
    to: to,
    from: from,
    subject: subject,
    text: body
  };

  Core.sendMail(mailOptions, function(err) {
    if (err)
      return next(err);
    res.status(200).end();
  });
};