import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Email Service
 * Handles sending verification emails using Gmail SMTP
 */

// Configure transporter for Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'mushimiyimukizab@gmail.com',
    pass: process.env.EMAIL_PASSWORD // Use Gmail App Password
  }
});

/**
 * Generate a 6-digit verification code
 */
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send verification email
 */
export const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'mushimiyimukizab@gmail.com',
      to: email,
      subject: 'HafiHub Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #639922 0%, #3B6D11 100%); padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">HafiHub</h1>
            <p style="color: #f0f0f0; margin: 0.5rem 0 0 0;">Local Economic Marketplace</p>
          </div>
          
          <div style="background: #f8f9f4; padding: 2rem; border-radius: 0 0 8px 8px;">
            <h2 style="color: #3B6D11; margin-top: 0;">Verify Your Email</h2>
            
            <p style="color: #333; font-size: 1rem; line-height: 1.6;">
              Welcome to HafiHub! To complete your registration, please verify your email address.
            </p>
            
            <div style="background: white; padding: 2rem; border-radius: 8px; text-align: center; margin: 2rem 0; border: 2px solid #639922;">
              <p style="color: #666; font-size: 0.9rem; margin: 0 0 1rem 0;">Your verification code is:</p>
              <h1 style="color: #639922; letter-spacing: 2px; margin: 0; font-size: 2.5rem;">${verificationCode}</h1>
              <p style="color: #999; font-size: 0.85rem; margin: 1rem 0 0 0;">This code expires in 15 minutes</p>
            </div>
            
            <p style="color: #666; font-size: 0.95rem; line-height: 1.6;">
              Enter this code in the verification field to confirm your email address and complete your HafiHub registration.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 2rem 0;">
            
            <p style="color: #999; font-size: 0.85rem; line-height: 1.6;">
              If you didn't request this verification code, please ignore this email. This is an automated message, please don't reply to this email.
            </p>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 0.8rem; margin: 0;">
                © ${new Date().getFullYear()} HafiHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

/**
 * Send welcome email after successful registration
 */
export const sendWelcomeEmail = async (email, name) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'mushimiyimukizab@gmail.com',
      to: email,
      subject: 'Welcome to HafiHub!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #639922 0%, #3B6D11 100%); padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">HafiHub</h1>
            <p style="color: #f0f0f0; margin: 0.5rem 0 0 0;">Local Economic Marketplace</p>
          </div>
          
          <div style="background: #f8f9f4; padding: 2rem; border-radius: 0 0 8px 8px;">
            <h2 style="color: #3B6D11; margin-top: 0;">Welcome, ${name}!</h2>
            
            <p style="color: #333; font-size: 1rem; line-height: 1.6;">
              Your email has been verified and your account is now active. You're all set to start using HafiHub!
            </p>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; border-left: 4px solid #639922;">
              <h3 style="color: #639922; margin-top: 0;">Get Started:</h3>
              <ul style="color: #333; margin: 0; padding-left: 1.5rem;">
                <li>Create and share job opportunities</li>
                <li>Browse services and products</li>
                <li>Connect with local entrepreneurs</li>
                <li>Build your professional network</li>
              </ul>
            </div>
            
            <p style="color: #666; font-size: 0.95rem; line-height: 1.6;">
              If you have any questions, please don't hesitate to contact us. We're here to help you succeed!
            </p>
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 0.8rem; margin: 0;">
                © ${new Date().getFullYear()} HafiHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email - account is already created
  }
};

/**
 * Send event booking confirmation email (free event)
 */
export const sendFreeEventBookingEmail = async (email, userName, eventTitle, eventDate, eventLocation) => {
  try {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'mushimiyimukizab@gmail.com',
      to: email,
      subject: `Booking Confirmed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #639922 0%, #3B6D11 100%); padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">HafiHub</h1>
            <p style="color: #f0f0f0; margin: 0.5rem 0 0 0;">Event Booking Confirmation</p>
          </div>
          
          <div style="background: #f8f9f4; padding: 2rem; border-radius: 0 0 8px 8px;">
            <h2 style="color: #3B6D11; margin-top: 0;">Booking Confirmed, ${userName}!</h2>
            
            <p style="color: #333; font-size: 1rem; line-height: 1.6;">
              Your booking for the event has been confirmed. We look forward to seeing you there!
            </p>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; border-left: 4px solid #639922;">
              <h3 style="color: #639922; margin-top: 0;">Event Details:</h3>
              <div style="color: #333; font-size: 0.95rem;">
                <p style="margin: 0.5rem 0;"><strong>Event:</strong> ${eventTitle}</p>
                <p style="margin: 0.5rem 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 0.5rem 0;"><strong>Location:</strong> ${eventLocation}</p>
                <p style="margin: 0.5rem 0;"><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">FREE EVENT</span></p>
              </div>
            </div>
            
            <p style="color: #666; font-size: 0.95rem; line-height: 1.6;">
              Please make sure to arrive on time. If you have any questions about the event, feel free to reach out to the event organizer.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 2rem 0;">
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 0.8rem; margin: 0;">
                © ${new Date().getFullYear()} HafiHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Free event booking email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending free event booking email:', error);
    throw new Error('Failed to send booking confirmation email');
  }
};

/**
 * Send paid event booking confirmation email
 */
export const sendPaidEventBookingEmail = async (email, userName, eventTitle, eventDate, eventLocation, amount, currency = 'RWF') => {
  try {
    const formattedDate = new Date(eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER || 'mushimiyimukizab@gmail.com',
      to: email,
      subject: `Payment Successful: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #639922 0%, #3B6D11 100%); padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">HafiHub</h1>
            <p style="color: #f0f0f0; margin: 0.5rem 0 0 0;">Event Booking & Payment Confirmation</p>
          </div>
          
          <div style="background: #f8f9f4; padding: 2rem; border-radius: 0 0 8px 8px;">
            <h2 style="color: #3B6D11; margin-top: 0;">Payment Received, ${userName}!</h2>
            
            <p style="color: #333; font-size: 1rem; line-height: 1.6;">
              Your payment has been processed successfully. Your booking for the event is now confirmed.
            </p>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; border-left: 4px solid #27ae60;">
              <h3 style="color: #27ae60; margin-top: 0;">✓ Payment Confirmed</h3>
              <div style="color: #333; font-size: 0.95rem;">
                <p style="margin: 0.5rem 0;"><strong>Amount Paid:</strong> ${currency} ${amount.toLocaleString()}</p>
                <p style="margin: 0.5rem 0;"><strong>Status:</strong> <span style="color: #27ae60; font-weight: bold;">COMPLETED</span></p>
              </div>
            </div>
            
            <div style="background: white; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; border-left: 4px solid #639922;">
              <h3 style="color: #639922; margin-top: 0;">Event Details:</h3>
              <div style="color: #333; font-size: 0.95rem;">
                <p style="margin: 0.5rem 0;"><strong>Event:</strong> ${eventTitle}</p>
                <p style="margin: 0.5rem 0;"><strong>Date & Time:</strong> ${formattedDate}</p>
                <p style="margin: 0.5rem 0;"><strong>Location:</strong> ${eventLocation}</p>
              </div>
            </div>
            
            <p style="color: #666; font-size: 0.95rem; line-height: 1.6;">
              Please make sure to arrive on time. Your booking is now active and you're all set to enjoy the event. A receipt has been included below.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 2rem 0;">
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 0.8rem; margin: 0;">
                © ${new Date().getFullYear()} HafiHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Paid event booking email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending paid event booking email:', error);
    throw new Error('Failed to send booking confirmation email');
  }
};

/**
 * Send payment failed email
 */
export const sendPaymentFailedEmail = async (email, userName, eventTitle, reason = 'Technical issue') => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'mushimiyimukizab@gmail.com',
      to: email,
      subject: `Payment Failed: ${eventTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%); padding: 2rem; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">HafiHub</h1>
            <p style="color: #f0f0f0; margin: 0.5rem 0 0 0;">Payment Failed</p>
          </div>
          
          <div style="background: #f8f9f4; padding: 2rem; border-radius: 0 0 8px 8px;">
            <h2 style="color: #c0392b; margin-top: 0;">Payment Could Not Be Processed</h2>
            
            <p style="color: #333; font-size: 1rem; line-height: 1.6;">
              We tried to process your payment for the event but encountered an issue.
            </p>
            
            <div style="background: #fff3cd; padding: 1.5rem; border-radius: 8px; margin: 2rem 0; border-left: 4px solid #e74c3c;">
              <h3 style="color: #c0392b; margin-top: 0;">What happened?</h3>
              <p style="color: #333; margin: 0;">
                ${reason}
              </p>
            </div>
            
            <p style="color: #666; font-size: 0.95rem; line-height: 1.6;">
              Please try again or contact HafiHub support for assistance. Your booking was not confirmed because payment was not completed.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 2rem 0;">
            
            <div style="text-align: center; margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 0.8rem; margin: 0;">
                © ${new Date().getFullYear()} HafiHub. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Payment failed email sent:', info.response);
    return true;
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    throw new Error('Failed to send payment failed email');
  }
};
