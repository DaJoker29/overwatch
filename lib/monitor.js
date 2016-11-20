const blc = require('broken-link-checker');
const targets = require('../targets.json');

const options = {};

/**
 * Monitoring
 */

exports.run = runChecks;

function runChecks() {
  console.log('running checks...');
  const tally = {
    websites: {
      complete: [],
      broken: [],
      excluded: [],
      completeCount: 0,
      brokenCount: 0,
      excludedCount: 0,
    },
    services: {
      complete: [],
      broken: [],
      excluded: [],
      completeCount: 0,
      brokenCount: 0,
      excludedCount: 0,
    },
  };

  /**
   * Scan websites
   */
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
        tally.websites.complete.push({ base, resolved, statusCode });
        tally.websites.completeCount += 1;

        if (result.broken) {
          const reason = result.brokenReason;
          tally.websites.broken.push({ base, resolved, reason });
          tally.websites.brokenCount += 1;
        }

        if (result.excluded) {
          const reason = result.excludedReason;
          tally.websites.excluded.push({ base, resolved, reason });
          tally.websites.excludedCount += 1;
        }
      }
    },
    // page: (err, url, data) => {},
    // site: (err, url, data) => {},
    end: () => {
      console.log('Website check complete');
      console.log(tally.websites);
    },
  });

  targets.websites.forEach((website) => {
    siteChecker.enqueue(website);
  });

  /**
   * Scan Services/APIs
   */
  const urlChecker = new blc.UrlChecker(options, {
    link: (result) => {
      const url = result.url.original;
      const resolved = result.url.resolved;
      const statusCode = result.http.response.statusCode;

      // Handle completion
      tally.services.complete.push({ url, resolved, statusCode });
      tally.services.completeCount += 1;

      if (result.broken) {
        const reason = result.brokenReason;
        tally.services.broken.push({ url, reason });
        tally.services.brokenCount += 1;
      }

      if (result.excluded) {
        const reason = result.excludedReason;
        tally.services.excluded.push({ url, reason });
        tally.services.excludedCount += 1;
      }
    },
    end: () => {
      console.log('Service/API check complete');
      console.log(tally.services);
    },
  });

  targets.services.forEach((service) => {
    urlChecker.enqueue(service);
  });
}