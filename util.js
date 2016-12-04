const nodemailer = require('nodemailer');
const config = require('./private.json');

const transporter = nodemailer.createTransport({
  service: 'Mailgun',
  auth: {
    user: config.MAILGUN_USER || '',
    pass: config.MAILGUN_PASS || '',
  },
});

function sendEmail(changes, cb) {
  const msg = buildMsg(changes);
  const mail = {
    from: config.FROM_ADDRESS || '',
    to: config.TO_ADDRESS || '',
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
    cb();
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

module.exports.sendEmail = sendEmail;
