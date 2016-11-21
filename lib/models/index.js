const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const siteSchema = new Schema({
  time: { type: Date, default: Date.now, required: true },
  broken: { type: [Schema.Types.Mixed] },
});

const serviceSchema = new Schema({
  time: { type: Date, default: Date.now, required: true },
  broken: { type: [Schema.Types.Mixed] },
});

exports.service = mongoose.model('service', serviceSchema);
exports.site = mongoose.model('site', siteSchema);