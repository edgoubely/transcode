var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  ObjectId = Schema.ObjectId;

var taskSchema = new Schema({
  user: {
    type: ObjectId,
    ref: 'User'
  },
  name: String,
  job: String,
  command: String,
  status: String,
  submissionDate: Date,
  computeTime: Number,

  source: {
    infos: String,
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