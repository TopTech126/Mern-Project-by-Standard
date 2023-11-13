const nodeMailer = require('nodemailer');
const logger = require('../logs/logger');
require('path');
require('dotenv').config({ path: '.env' });

exports.sendEmailWithNodemailer = (req, res, emailData) => {
  const transporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,
    auth: {
      user: 'devangmanjramkar@gmail.com',
      pass: process.env.MAIL_PWD,
    },
    tls: {
      ciphers: 'SSLv3',
    },
  });

  return transporter
    .sendMail(emailData)
    .then((info) => {
      console.log(`Message sent: ${info.response}`);
      return res.json({
        message: `Email has been sent to your email. Follow the instruction to activate your account`,
      });
    })
    .catch((err) => console.log(`Problem sending email: ${err}`));
};
