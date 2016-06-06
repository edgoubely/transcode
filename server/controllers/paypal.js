var ipn = require('paypal-ipn');

exports.notifications = function(io) {
  return function(req, res, next) {
    var opts = {
      'allow_sandbox': true
    };
    console.log('RPN: received inc request');
    console.log(req.body);

    res.status(200)
    res.end('OK');

    ipn.verify(req.body, opts, function callback(err, mes) {
      if (err) {
        console.error('IPN: cannot verify', err);
        return next(err);
      }
      console.log('IPN: verified');
    });
  };
};