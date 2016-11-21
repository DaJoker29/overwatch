const mongoose = require('mongoose');
const Site = require('./models').site;
const Service = require('./models').service;

mongoose.Promise = global.Promise;

function addSiteResults(broken, callback) {
  mongoose.connect('mongodb://localhost/overwatch');
  console.log('saving site check results...');
  Site.create({ broken }, callback);
  close();
}

function addServiceResults(broken, callback) {
  mongoose.connect('mongodb://localhost/overwatch');
  console.log('saving service check results...');
  Service.create({ broken }, callback);
  close();
}

function close() {
  mongoose.disconnect();
}

// function compareResults(callback) {
//   console.log('Comparing results...');
//   Site
//     .find()
//     .sort({ time: -1 })
//     .limit(2)
//     .exec((err, data) => {
//       if (err) {
//         callback(err);
//       } else {
//         const current = data[0].broken;
//         const last = data[1].broken;
//         const added = current.filter((e) => {
//           last.forEach((element) => {
//             return JSON.stringify(e) === JSON.stringify(element);
//           });
//         });
//         const removed = last.filter((e) => {
//           current.forEach((element) => {
//             return JSON.stringify(e) === JSON.stringify(element);
//           });
//         });
//         // const removed = last.filter(e => -1 === current.indexOf(JSON.stringify(e)));
//         callback(null, { added, removed });
//       }
//     });
// }

// exports.compareResults = compareResults;
exports.addServiceResults = addServiceResults;
exports.addSiteResults = addSiteResults;