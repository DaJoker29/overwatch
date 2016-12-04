#!/usr/bin/env node
const blc = require('broken-link-checker');
const mongoose = require('mongoose');
const _ = require('lodash');
const config = require('./private.json');
const check = require('./schema.js').check;
const util = require('./util.js');

const options = {};
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/overwatch');

/**
 * Overwatch - Enhanced Monitoring
 * @module Overwatch
 */

console.log('Running overwatch...');

// Build Tally
const tally = {
  complete: [],
  broken: [],
  excluded: [],
  completeCount: 0,
  brokenCount: 0,
  excludedCount: 0,
};

// Build Checker
const urlChecker = new blc.UrlChecker(options, {
  link: (result) => {
    const url = result.url.original;
    const resolved = result.url.resolved;
    const statusCode = result.http.response.statusCode;

    console.log(`${url} - ${statusCode}`);
    // Handle completion
    tally.complete.push({ url, resolved, statusCode });
    tally.completeCount += 1;

    if (result.broken) {
      const reason = result.brokenReason;
      tally.broken.push({ url, reason });
      tally.brokenCount += 1;
    }

    if (result.excluded) {
      const reason = result.excludedReason;
      tally.excluded.push({ url, reason });
      tally.excludedCount += 1;
    }
  },
  end: () => {
    console.log('URL Check Complete...');
    try {
      check.create({ broken: tally.broken }, () => {
        check
          .find()
          .sort({ time: -1 })
          .limit(2)
          .exec((err, data) => {
            compareChecks(err, data, () => {
              mongoose.disconnect();
              process.exit();
            });
          });
      });
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  },
});

function compareChecks(err, data, cb) {
  if (err) { throw err; }

  const current = data[1].broken;
  const last = data[0].broken;

  // Compare last result and current result
  if (_.isEqual(current, last)) {
    console.log('No Changes Found...');
    cb();
  } else {
    console.log('Changes Found...');
    const added = _.differenceWith(current, last);
    const removed = _.differenceWith(last, current);
    util.sendEmail({ added, removed }, cb);
  }
}

// Queue Checks
config.URLS.forEach((url) => {
  urlChecker.enqueue(url);
});