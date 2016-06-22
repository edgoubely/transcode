var mongoose = require('mongoose'),
  bcrypt = require('bcrypt-nodejs'),
  jwt = require('jsonwebtoken'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var userSchema = new Schema({
  email: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    lowercase: true,
    sparse: true
  },
  password: String,
  profile: {
    name: String,
    picture: String,
  },
  providers: {
    facebook: String,
    google: String
  },
  taskSubmissions: {
    type: Number,
    default: 0
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isLocalAccount: {
    type: Boolean,
    default: false
  },
  updated: {
    type: Date,
    default: Date.now
  },
  created: {
    type: Date,
    default: Date.now
  },
  pricing: {
    type: String,
    default: 'free'
  }
});

userSchema.pre('save', function(next) {
  var user = this;

  if (!user.isModified('password'))
    return next();

  // 200+ ms
  bcrypt.genSalt(10, function(err, salt) {
    if (err)
      return next(err);

    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err)
        return next(err);
      user.password = hash;
      next();
    });
  });
});

// 200+ ms
userSchema.methods.comparePassword = function(password, cb) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    if (err)
      return cb(err);
    cb(null, isMatch);
  });
};

userSchema.methods.getAccountInfos = function() {
  return {
    id: this._id,
    email: this.email,
    name: this.profile.name,
    picture: this.profile.picture,
    isLocal: this.isLocal,
    providers: this.providers
  };
};

userSchema.methods.saveAndSend = function(response) {
  this.save(function(err, user) {
    response.status(200);
    response.json({
      user: user.getAccountInfos()
    });
  });
};

userSchema.methods.saveAndSendWithToken = function(response) {
  this.save(function(err, user) {
    var tokenPayload = {
      id: user._id.toString()
    };
    var token = jwt.sign(
      tokenPayload,
      response.app.get('secret'),
      response.app.get('token_expires'));
    response.status(200);
    response.json({
      token: token,
      user: user.getAccountInfos()
    });
  });
};

module.exports = mongoose.model('User', userSchema);