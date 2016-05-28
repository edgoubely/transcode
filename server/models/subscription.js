var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var subscriptionPlanSchema = new mongoose.Schema({	
	storage: Number,
	pricePerHour: Number,
	notifications: Boolean,
});

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);