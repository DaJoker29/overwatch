#!/usr/bin/env node
const monitor = require('../lib/monitor.js');

monitor.siteChecks((err) => {
  if (err) {
    console.log(err);
  }
});
monitor.serviceChecks((err) => {
  if (err) {
    console.log(err);
  }
});