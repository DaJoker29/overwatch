const schedule = require('node-schedule');
const monitor = require('./lib/monitor.js');

const interval = {
  service: process.env.SERVICE_INTERVAL || '*/15 * * * *',
  site: process.env.SITE_INTERVAL || '1 * * * *',
};


/**
 * Overwatch - Enhanced Monitoring
 * @module Overwatch
 */

console.log('launching overwatch...');

// Run service checks every 30 minutes
const services = schedule.scheduleJob(interval.service, () => {
  monitor.serviceChecks(handleCheck);
});

// Run website checks once an hour
const sites = schedule.scheduleJob(interval.site, () => {
  monitor.siteChecks(handleCheck);
});

function handleCheck(err, changes) {
  if (err) {
    console.error(err);
  }

  if (changes) {
    const message = buildMsg(changes);
    console.log(message);
  }
}

function buildMsg(changes) {
  const msg = [`Overwatch has detected a change on the following monitored property.\n`];
  if (changes.added) {
    changes.added.forEach((e) => {
      msg.push(`Up: ${e.resolved || e.url}\n`);
    });
  }

  if (changes.removed) {
    changes.removed.forEach((e) => {
      msg.push(`Down: ${e.resolved || e.url}\n`);
    });
  }

  msg.push('\nAll changes reported.\n');
  return msg.join('');
}

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('caught exception:');
  console.error(err);
  console.trace();
});
