module.exports = {
    service: 'Gmail', // Use 'Gmail', 'Outlook', or any other service
    host: 'smtp.gmail.com', // SMTP host for your email service
    port: 465, // SMTP port (587 for TLS, 465 for SSL)
    secure: false, // true for 465 (SSL), false for other ports
    auth: {
      user: process.env.SMTP_USER, // Your email address
      pass: process.env.SMTP_PASSWORD, // Your email password or app-specific password
    },
  };