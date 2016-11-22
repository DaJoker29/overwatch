const mongoose = require('mongoose');
const _ = require('lodash');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/overwatch');

function addResults(model, broken, callback) {
  console.log(`saving ${model.modelName} check results...`);
  model.create({ broken }, () => {
    compareResults(model, (err, changes) => {
      if (err) {
        callback(err);
      } else if (changes) {
        callback(null, changes);
      }
      callback(null);
    });
  });
}

function compareResults(model, callback) {
  const { modelName } = model;
  console.log(`comparing ${modelName} check results...`);

  // Fetch last two results
  model
    .find()
      .sort({ time: -1 })
      .limit(2)
      .exec((err, data) => {
        if (err) {
          callback(err);
        } else {
          const current = data[1].broken;
          const last = data[0].broken;

          // Compare last result and current result
          if (_.isEqual(current, last)) {
            console.log(`${modelName} comparison complete: no changes`);
            callback(null);
          } else {
            console.log(`${modelName} comparison complete: changes noted`);
            const added = _.differenceWith(current, last);
            const removed = _.differenceWith(last, current);
            callback(null, { added, removed });
          }
        }
      });
}

exports.addResults = addResults;