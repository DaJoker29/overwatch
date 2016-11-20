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
  };

  /**
   * Scan websites
   */
  const siteChecker = new blc.SiteChecker(options, {
    // robots: (robots, data) => {},
    // html: (tree, robots) => {},
    // junk: (result) => {},
    link: (result) => {
      const url = result.url.original;
      const resolved = result.url.resolved;
      const base = result.base.original;
      console.log(`${base}: ${resolved}: ${result.http.cached ? 'cached' : 'not in cache'}`);

      // Handle completion
      if (!result.http.cached) {
        tally.websites.complete.push(url);
        tally.websites.completeCount += 1;

        if (result.broken) {
          const reason = result.brokenReason;
          tally.websites.broken.push({ url, reason });
          tally.websites.brokenCount += 1;
        }

        if (result.excluded) {
          const reason = result.excludedReason;
          tally.websites.excluded.push({ url, reason });
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
}