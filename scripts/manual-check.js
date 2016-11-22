#!/usr/bin/env node
const monitor = require('../lib/monitor.js');

monitor.siteChecks((err, changes) => {
  if (err) {
    console.error(err);
  }

  if (changes) {
    console.log(changes);
  }
});
monitor.serviceChecks((err, changes) => {
  if (err) {
    console.error(err);
  }

  if (changes) {
    console.log(changes);
  }
});