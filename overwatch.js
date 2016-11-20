const schedule = require('node-schedule');
const monitor = require('./lib/monitor.js');

const interval = '*/15 * * * *';
/**
 * Overwatch - Enhanced Monitoring
 * @module Overwatch
 */

console.log('launching overwatch...');
schedule.scheduleJob(interval, monitor.run);

/**
 * Handle uncaught exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('caught exception:');
  console.error(err);
  console.trace();
});
