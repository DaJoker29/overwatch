const schedule = require('node-schedule');
const nodemailer = require('nodemailer');
const monitor = require('./lib/monitor.js');

const interval = {
  service: process.env.SERVICE_INTERVAL || '*/15 * * * *',
  site: process.env.SITE_INTERVAL || '1 * * * *',
};

const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: process.env.MAILGUN_USER || '',
    pass: process.env.MAILGUN_PASS || '',
  },
});

/**
 * Overwatch - Enhanced Monitoring
 * @module Overwatch
 */

console.log('launching Overwatch...');

// Run service checks every 30 minutes
schedule.scheduleJob(interval.service, () => {
  monitor.serviceChecks(handleCheck);
});

// Run website checks once an hour
schedule.scheduleJob(interval.site, () => {
  monitor.siteChecks(handleCheck);
});

function handleCheck(err, changes) {
  if (err) {
    console.error(err);
  }

  if (changes) {
    sendMsg(buildMsg(changes));
  }
}

function sendMsg(msg) {
  const mail = {
    from: process.env.FROM_ADDRESS || '',
    to: process.env.TO_ADDRESS || '',
    subject: 'Overwatch alert',
    text: msg,
    html: `<pre>${msg}</pre>`,
  };

  transporter.sendMail(mail, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`Alert sent: ${info.response}`);
    }
  });
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
