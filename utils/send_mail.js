const nodemailer = require("nodemailer");

// Set up the transporter using your email service (Gmail in this case)
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE,
  auth: {
    user: process.env.EMAIL_USERNAME, // your email address
    pass: process.env.EMAIL_PASSWORD, // your email password
  },
});

// Create a function to send emails
const sendEmail = (subject, text, to) => {
  const mailOptions = {
    from: process.env.EMAIL_USERNAME, // sender address
    to: to, // recipient address
    subject: subject, // email subject
    text: text, // email body (plain text)
  };

  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("[EmailSender] Error occurred:", error);
    } else {
      console.log("[EmailSender] Email sent: " + info.response);
    }
  });
};

module.exports = sendEmail;
