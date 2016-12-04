const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const checkSchema = new Schema({
  time: { type: Date, default: Date.now, required: true },
  broken: { type: [Schema.Types.Mixed] },
});

exports.check = mongoose.model('check', checkSchema);
