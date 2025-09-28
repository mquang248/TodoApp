const nodemailer = require('nodemailer');

// Alternative email service configurations
const getEmailServiceConfig = () => {
  // Check if SendGrid is configured
  if (process.env.SENDGRID_API_KEY) {
    return {
      service: 'SendGrid',
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY
      }
    };
  }
  
  // Fallback to Gmail configurations
  return null;
};

class EmailService {
  constructor() {
    // Check if email credentials are configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('Email credentials not configured. Email functionality will be disabled.');
      this.transporter = null;
      return;
    }

    // Try multiple SMTP configurations for better reliability
    const smtpConfigs = [];
    
    // Add SendGrid if configured
    const sendGridConfig = getEmailServiceConfig();
    if (sendGridConfig) {
      smtpConfigs.push(sendGridConfig);
    }
    
    // Add Gmail configurations
    smtpConfigs.push(
      // Configuration 1: Gmail with SSL (port 465)
      {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000
      },
      // Configuration 2: Gmail with STARTTLS (port 587)
      {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 30000,
        greetingTimeout: 15000,
        socketTimeout: 30000
      }
    );

    // Try the first configuration
    this.transporter = nodemailer.createTransport(smtpConfigs[0]);
    this.fallbackTransporter = smtpConfigs[1] ? nodemailer.createTransport(smtpConfigs[1]) : null;
  }

  async sendOTP(email, otp, type) {
    // If email is not configured, just log the OTP for development
    if (!this.transporter) {
      console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      // Try primary transporter first
      let transporter = this.transporter;
      try {
        await this.transporter.verify();
      } catch (primaryError) {
        console.log('Primary SMTP failed, trying fallback...');
        if (this.fallbackTransporter) {
          try {
            await this.fallbackTransporter.verify();
            transporter = this.fallbackTransporter;
            console.log('Fallback SMTP connection successful');
          } catch (fallbackError) {
            console.error('Both SMTP configurations failed:', { primaryError, fallbackError });
            throw primaryError; // Throw the original error
          }
        } else {
          console.error('No fallback SMTP configuration available');
          throw primaryError;
        }
      }

      const subject = type === 'registration' 
        ? 'Account Registration Confirmation - TodoApp' 
        : 'Password Reset - TodoApp';

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #fb923c; margin: 0;">TodoApp</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; text-align: center;">
            <h2 style="color: #333; margin-bottom: 20px;">
              ${type === 'registration' ? 'Account Registration Confirmation' : 'Password Reset'}
            </h2>
            
            <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
              ${type === 'registration' 
                ? 'Thank you for registering with TodoApp. Please use the OTP code below to confirm your account.'
                : 'You have requested to reset your password. Please use the OTP code below to continue.'
              }
            </p>
            
            <div style="background-color: #fb923c; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 8px; letter-spacing: 5px; margin: 20px 0;">
              ${otp}
            </div>
            
            <p style="color: #999; font-size: 14px; margin-top: 30px;">
              This OTP code is valid for 10 minutes. Please do not share this code with anyone.
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>If you did not request this action, please ignore this email.</p>
            <p>© 2025 TodoApp. All rights reserved.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"TodoApp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Log OTP for debugging in case of email failure
      console.log(`[FALLBACK] OTP for ${email}: ${otp}`);
      
      // Return success with fallback message
      return { 
        success: true, 
        messageId: 'fallback-mode',
        fallback: true,
        message: 'Email service temporarily unavailable, OTP logged for debugging'
      };
    }
  }

  async sendWelcomeEmail(email, name) {
    // If email is not configured, just log for development
    if (!this.transporter) {
      console.log(`[DEV MODE] Welcome email for ${name} (${email})`);
      return { success: true, messageId: 'dev-mode' };
    }

    try {
      // Try primary transporter first
      let transporter = this.transporter;
      try {
        await this.transporter.verify();
      } catch (primaryError) {
        console.log('Primary SMTP failed for welcome email, trying fallback...');
        if (this.fallbackTransporter) {
          try {
            await this.fallbackTransporter.verify();
            transporter = this.fallbackTransporter;
            console.log('Fallback SMTP connection successful for welcome email');
          } catch (fallbackError) {
            console.error('Both SMTP configurations failed for welcome email:', { primaryError, fallbackError });
            throw primaryError; // Throw the original error
          }
        } else {
          console.error('No fallback SMTP configuration available for welcome email');
          throw primaryError;
        }
      }

      const subject = 'Welcome to TodoApp!';
      
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #fb923c; margin: 0;">TodoApp</h1>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px;">
            <h2 style="color: #333; margin-bottom: 20px;">Welcome ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for registering with TodoApp. Your account has been successfully confirmed!
            </p>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              You can now start using TodoApp to efficiently manage your work and tasks.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" 
                 style="background-color: #fb923c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Get Started
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #999; font-size: 12px;">
            <p>© 2024 TodoApp. All rights reserved.</p>
          </div>
        </div>
      `;

      const mailOptions = {
        from: `"TodoApp" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: html
      };

      const result = await transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Welcome email sending failed:', error);
      throw new Error('Failed to send welcome email');
    }
  }
}

module.exports = new EmailService();
