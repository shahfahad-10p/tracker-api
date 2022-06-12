// using Twilio SendGrid's v3 Node.js Library
// https://github.com/sendgrid/sendgrid-nodejsjavascript

const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const msg = {
  to: "sfahad@khi.iba.edu.pk", // Change to your recipient
  from: "fahad_masood91@hotmail.com", // Change to your verified sender
  subject: "M11 Notification - Tracker Update",
  // text: "and easy to do anywhere, even with Node.js",
  html: "",
};

const sendEmail = (text, recipient) => {
  // TODO FORMAT EMAIL
  msg.html = `<strong>${text}<strong>`;
  msg.to = recipient;
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
