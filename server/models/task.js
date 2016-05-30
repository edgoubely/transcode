var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var taskSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User'
  },
  purpose: String,
  status: String,
  submissionDate: Date,
  computeTime: Number,

  source: {
    infos: String,
    displayName: String,
    filename: String,
    path: String,
    date: {
      type: Date,
      default: Date.now
    }
  },
  target: {
    format: String,
    filename: String
  }
});

module.exports = mongoose.model('Task', taskSchema);