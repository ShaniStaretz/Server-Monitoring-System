const nodemailer = require('nodemailer');

// Set up the transporter using your email service (Gmail in this case)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com',  // your email address
        pass: 'your-email-password'    // your email password
    }
});

// Create a function to send emails
const sendEmail = (subject, text, to) => {
    const mailOptions = {
        from: 'your-email@gmail.com',    // sender address
        to: to,                          // recipient address
        subject: subject,                // email subject
        text: text,                      // email body (plain text)
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Error occurred:', error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};

module.exports = sendEmail;
