const nodemailer = require('nodemailer');

// Lazy-load Resend SDK if available
let ResendClient = null;
try {
  const { Resend } = require('resend');
  ResendClient = Resend;
} catch (e) {
  // Resend will be loaded dynamically if needed
}

/**
 * Build the branded Neo-Brutalist HTML template for OTP verification
 */
const getEmailTemplate = (otp, type = 'login') => {
  const isLogin = type === 'login';
  const title = isLogin ? 'Your Login Verification Code' : 'Verify Your Email Address';
  const subtitle = isLogin
    ? 'Use the single-use 6-digit code below to securely sign in to GDG RBU EventHub.'
    : 'Welcome to Google Developer Group on Campus RBU! Enter this 6-digit code to complete your registration.';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background-color: #FCFDF8;
          color: #000000;
          margin: 0;
          padding: 24px 12px;
        }
        .container {
          max-width: 520px;
          margin: 0 auto;
          background-color: #FFFFFF;
          border: 3px solid #000000;
          border-radius: 8px;
          box-shadow: 6px 6px 0px 0px #000000;
          overflow: hidden;
        }
        .header {
          background-color: #FFFFFF;
          border-bottom: 3px solid #000000;
          padding: 24px;
          text-align: center;
        }
        .badge {
          display: inline-block;
          background-color: #FACC15;
          color: #000000;
          border: 2px solid #000000;
          padding: 4px 12px;
          font-weight: 800;
          font-size: 11px;
          letter-spacing: 0.08em;
          border-radius: 4px;
          box-shadow: 2px 2px 0px 0px #000000;
          margin-bottom: 10px;
          text-transform: uppercase;
        }
        .content {
          padding: 32px 24px;
          text-align: center;
        }
        .title {
          font-size: 22px;
          font-weight: 900;
          margin: 0 0 10px 0;
          color: #000000;
          letter-spacing: -0.02em;
        }
        .subtitle {
          font-size: 14px;
          color: #52525B;
          line-height: 1.6;
          margin: 0 0 24px 0;
        }
        .otp-container {
          margin: 20px 0 24px 0;
        }
        .otp-box {
          background-color: #FEF08A;
          border: 3px solid #000000;
          border-radius: 8px;
          padding: 16px 24px;
          display: inline-block;
          font-size: 36px;
          font-weight: 900;
          letter-spacing: 10px;
          color: #000000;
          box-shadow: 4px 4px 0px 0px #000000;
          font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
        }
        .security-note {
          background-color: #FEE2E2;
          border: 2px solid #EF4444;
          border-radius: 6px;
          padding: 12px;
          font-size: 12px;
          color: #991B1B;
          font-weight: 700;
          margin-top: 20px;
          line-height: 1.5;
        }
        .footer {
          border-top: 2px solid #000000;
          padding: 18px 24px;
          text-align: center;
          font-size: 12px;
          color: #71717A;
          background-color: #FAFAFA;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">GDG ON CAMPUS · RBU</div>
          <div style="font-weight: 900; font-size: 17px; letter-spacing: -0.01em;">RAMDEOBABA UNIVERSITY</div>
          <div style="font-size: 12px; color: #52525B; margin-top: 4px; font-weight: 600;">EventHub Authentication</div>
        </div>
        <div class="content">
          <h1 class="title">${title}</h1>
          <p class="subtitle">${subtitle}</p>
          <div class="otp-container">
            <div class="otp-box">${otp}</div>
          </div>
          <div class="security-note">
            ⚠️ This code expires in 10 minutes and can only be used once.<br>
            Never share this verification code with anyone. GDG admins will never ask for your code.
          </div>
        </div>
        <div class="footer">
          If you did not request this verification code, you can safely ignore this email.<br>
          © 2026 Google Developer Groups on Campus · Shri Ramdeobaba University, Nagpur
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Send OTP Verification Email via Gmail SMTP or Resend API with resilient fallback
 */
const sendOtpEmail = async (email, otp, type = 'login') => {
  const cleanEmail = email.toLowerCase().trim();
  const htmlContent = getEmailTemplate(otp, type);
  const textContent = `Your GDG RBU EventHub verification code is: ${otp}\n\nThis code expires in 10 minutes and can only be used once.\nNever share this code with anyone.`;
  const subject = `[GDG RBU] ${otp} is your verification code`;

  // 1. Try Gmail SMTP if configured (can send to ANY email address in the world without domain limits)
  const smtpUser = process.env.EMAIL_USER;
  const smtpPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : null;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const fromAddress = `"GDG RBU EventHub" <${smtpUser}>`;
      const info = await transporter.sendMail({
        from: fromAddress,
        to: cleanEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      console.log(`✉️ [Gmail SMTP] OTP email sent successfully to ${cleanEmail} (ID: ${info.messageId})`);
      return { success: true, provider: 'smtp', id: info.messageId };
    } catch (smtpErr) {
      console.warn(`⚠️ [SMTP Notice] SMTP delivery failed (${smtpErr.message}), trying Resend fallback...`);
    }
  }

  // 2. Try Resend API
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && resendApiKey.trim() !== '') {
    try {
      if (!ResendClient) {
        const { Resend } = require('resend');
        ResendClient = Resend;
      }
      const resend = new ResendClient(resendApiKey.trim());
      const fromAddress = process.env.EMAIL_FROM || 'GDG RBU EventHub <onboarding@resend.dev>';

      const response = await resend.emails.send({
        from: fromAddress,
        to: cleanEmail,
        subject,
        text: textContent,
        html: htmlContent,
      });

      if (response && response.error) {
        throw new Error(response.error.message || 'Resend delivery rejected');
      }

      console.log(`✉️ [Resend] OTP email delivered to ${cleanEmail} (ID: ${response?.data?.id || 'OK'})`);
      return { success: true, provider: 'resend', id: response?.data?.id };
    } catch (resendErr) {
      console.warn(`⚠️ [Resend Notice] Resend delivery failed to ${cleanEmail}: ${resendErr.message}`);
    }
  }

  // 3. Fallback when in development or both providers fail
  if (process.env.NODE_ENV !== 'production') {
    console.log(`\n======================================================`);
    console.log(`🔑 DEV FALLBACK OTP FOR ${cleanEmail}: >>> [ ${otp} ] <<<`);
    console.log(`======================================================\n`);
  }

  return { success: true, provider: 'console-development' };
};

module.exports = {
  sendOtpEmail,
  getEmailTemplate,
};
