const nodemailer = require('nodemailer');

// Create transporter with Gmail SMTP
const createTransporter = () => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS // This should be the Gmail App Password
    }
  });

  return transporter;
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// HTML email template for OTP
const getOTPEmailTemplate = (otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your OTP for Foody Order Verification</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          background-color: #f4f4f4;
          padding: 20px;
        }
        .container {
          background-color: #ffffff;
          border-radius: 12px;
          padding: 40px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .logo {
          font-size: 28px;
          font-weight: bold;
          color: #ff6b35;
          margin-bottom: 10px;
        }
        .otp-container {
          background: linear-gradient(135deg, #ff6b35, #f7931e);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #ffffff;
          letter-spacing: 8px;
          font-family: 'Courier New', monospace;
          margin: 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        .message {
          font-size: 16px;
          color: #666;
          margin: 20px 0;
        }
        .warning {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 8px;
          padding: 15px;
          margin: 20px 0;
          color: #856404;
        }
        .footer {
          text-align: center;
          font-size: 14px;
          color: #888;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }
        .highlight {
          color: #ff6b35;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🍕 Foody</div>
          <h1>Your Order Verification Code</h1>
        </div>

        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>

        <div class="message">
          <p>Hello!</p>
          <p>Thank you for choosing <span class="highlight">Foody</span> for your food ordering needs. To complete your order verification, please use the 6-digit code above.</p>
        </div>

        <div class="warning">
          <strong>⚠️ Important:</strong> This OTP will expire in <strong>5 minutes</strong> for security reasons. Please do not share this code with anyone.
        </div>

        <div class="footer">
          <p>If you didn't request this verification code, please ignore this email.</p>
          <p>© 2024 Foody. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// Send OTP email
const sendOTPEmail = async (email, otp) => {
  try {
    const transporter = createTransporter();

    console.log('📧 Verifying transporter configuration...');
    // Verify transporter configuration
    await transporter.verify();
    console.log('📧 Transporter verified successfully');

    const mailOptions = {
      from: {
        name: 'Foody Order Verification',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: 'Your OTP for Foody Order Verification',
      html: getOTPEmailTemplate(otp)
    };

    console.log('📧 Sending email to:', email);
    const info = await transporter.sendMail(mailOptions);

    console.log('✅ OTP email sent successfully:', info.messageId);
    return {
      success: true,
      messageId: info.messageId,
      message: 'OTP email sent successfully'
    };

  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);

    let errorMessage = 'Failed to send OTP email';

    if (error.code === 'EAUTH') {
      errorMessage = 'Email authentication failed. Please check EMAIL_USER and EMAIL_PASS in environment variables.';
    } else if (error.code === 'ENOTFOUND') {
      errorMessage = 'Email service not found. Please check your internet connection.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Email service connection refused. Please check Gmail SMTP settings.';
    } else if (error.message && error.message.includes('Invalid login')) {
      errorMessage = 'Invalid Gmail credentials. Please check EMAIL_USER and EMAIL_PASS.';
    } else if (error.message && error.message.includes('Application-specific password required')) {
      errorMessage = 'Gmail requires an App Password. Please generate one from Google Account settings.';
    }

    return {
      success: false,
      error: errorMessage,
      details: error.message,
      code: error.code
    };
  }
};

module.exports = {
  generateOTP,
  sendOTPEmail,
  getOTPEmailTemplate
};