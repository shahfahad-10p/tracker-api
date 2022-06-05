// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejsjavascript

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: "sfahad@khi.iba.edu.pk", // Change to your recipient
  from: "fahad_masood91@hotmail.com", // Change to your verified sender
  subject: "Sending with SendGrid is Fun",
  // text: "and easy to do anywhere, even with Node.js",
  html: "<strong>and easy to do anywhere, even with Node.js</strong>",
};

const sendEmail = (text) => {
  msg.html = `<strong>${text}<strong>`;
  sgMail
    .send(msg)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  sendEmail,
};
