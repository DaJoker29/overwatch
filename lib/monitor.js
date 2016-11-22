const blc = require('broken-link-checker');
const targets = require('../targets.json');
const db = require('./database.js');
const models = require('./models');

const options = {};

/**
 * Monitoring
 */

exports.siteChecks = siteChecks;
exports.serviceChecks = serviceChecks;

function siteChecks(callback) {
  console.log('running website checks...');
  const tally = {
    complete: [],
    broken: [],
    excluded: [],
    completeCount: 0,
    brokenCount: 0,
    excludedCount: 0,
  };

  const siteChecker = new blc.SiteChecker(options, {
    // robots: (robots, data) => {},
    // html: (tree, robots) => {},
    // junk: (result) => {},
    link: (result) => {
      const resolved = result.url.resolved;
      const base = result.base.original;
      const statusCode = result.http.response.statusCode;

      // Handle completion
      if (!result.http.cached) {
        tally.complete.push({ base, resolved, statusCode });
        tally.completeCount += 1;

        if (result.broken) {
          const reason = result.brokenReason;
          tally.broken.push({ base, resolved, reason });
          tally.brokenCount += 1;
        }

        if (result.excluded) {
          const reason = result.excludedReason;
          tally.excluded.push({ base, resolved, reason });
          tally.excludedCount += 1;
        }
      }
    },
    // page: (err, url, data) => {},
    // site: (err, url, data) => {},
    end: () => {
      console.log(`${models.site.modelName} check: DONE`);
      db.addResults(models.site, tally.broken, callback);
    },
  });

  targets.websites.forEach((website) => {
    siteChecker.enqueue(website);
  });
}

function serviceChecks(callback) {
  console.log('running services checks...');
  const tally = {
    complete: [],
    broken: [],
    excluded: [],
    completeCount: 0,
    brokenCount: 0,
    excludedCount: 0,
  };

  const urlChecker = new blc.UrlChecker(options, {
    link: (result) => {
      const url = result.url.original;
      const resolved = result.url.resolved;
      const statusCode = result.http.response.statusCode;

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
      console.log(`${models.service.modelName} check: DONE`);
      db.addResults(models.service, tally.broken, callback);
    },
  });

  targets.services.forEach((service) => {
    urlChecker.enqueue(service);
  });
}