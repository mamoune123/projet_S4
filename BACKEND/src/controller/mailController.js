const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

// Create a transporter object
const transporter = nodemailer.createTransport({
  service: emailConfig.service,
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
});

// Function to send an email
const sendEmail = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: `"Task Management System" <${emailConfig.auth.user}>`, // Sender address
      to, // Recipient address
      subject, // Email subject
      text, // Plain text body
      html, // HTML body (optional)
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

// Example: Send email when a task is completed
const sendTaskCompletionEmail = async (userEmail, taskName) => {
  const subject = `Task Completed: ${taskName}`;
  const text = `Hello,\n\nYou have completed the task: ${taskName}.\n\nThank you!`;
  const html = `<p>Hello,</p><p>You have completed the task: <strong>${taskName}</strong>.</p><p>Thank you!</p>`;

  await sendEmail(userEmail, subject, text, html);
};

// Example: Send email when a comment is added
const sendCommentNotificationEmail = async (userEmail, taskName, comment) => {
  const subject = `New Comment on Task: ${taskName}`;
  const text = `Hello,\n\nA new comment has been added to the task: ${taskName}.\n\nComment: ${comment}\n\nThank you!`;
  const html = `<p>Hello,</p><p>A new comment has been added to the task: <strong>${taskName}</strong>.</p><p>Comment: ${comment}</p><p>Thank you!</p>`;

  await sendEmail(userEmail, subject, text, html);
};

module.exports = {
  sendTaskCompletionEmail,
  sendCommentNotificationEmail,
};