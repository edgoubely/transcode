var mongoose = require('mongoose'),
  dotenv = require('dotenv'),
  async = require('async'),
  SubscriptionPlan = require('./models/subscription');

dotenv.load({
  path: '.env'
});

mongoose.connect(process.env.DB);
mongoose.connection.on('error', function(err) {
  console.error("Connection to MongoDB failed :", err.message);
  process.exit(1);
});

async.series([
    function(callback) {
      SubscriptionPlan.remove({}, callback);
    },
    function(callback) {
      var tiny = new SubscriptionPlan({
        storage: 10 * 1024 * 1024 * 1024,
        pricePerHour: 1,
        notifications: false,
      });
      tiny.save(callback);
    },
    function(callback) {
      var medium = new SubscriptionPlan({
        storage: 50 * 1024 * 1024 * 1024,
        pricePerHour: 1,
        notifications: true,
      });
      medium.save(callback);
    },
    function(callback) {
      var large = new SubscriptionPlan({
        storage: 150 * 1024 * 1024 * 1024,
        pricePerHour: 0,
        notifications: true,
      });
      large.save(callback);
    }
  ],
  function(err) {
    if (err) {
      console.log('Setup failed :', err);
      process.exit(1);
    } else {
      console.log('Setup completed.')
      process.exit(0);
    }
  });