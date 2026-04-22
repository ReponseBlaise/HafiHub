import * as authService from '../services/auth.service.js';
import * as emailService from '../services/email.service.js';
import prisma from '../utils/db.js';

export const register = async (req, res, next) => {
  try {
    const { email, name, password, contact } = req.body;

    // Validate input
    if (!email || !name || !password || !contact) {
      return res.status(400).json({ error: 'Missing required fields: email, name, password, contact' });
    }

    const result = await authService.registerUser(email, name, password, contact);
    const { token, ...userData } = result;
    res.status(201).json({
      success: true,
      token,
      data: userData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await authService.loginUser(email, password);
    const { token, ...userData } = result;
    res.status(200).json({
      success: true,
      token,
      data: userData
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};

/**
 * Send verification code to email
 */
export const sendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Generate verification code
    const verificationCode = emailService.generateVerificationCode();

    // Store verification code with expiration (15 minutes)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Check if verification record exists
    const existingVerification = await prisma.emailVerification.findUnique({
      where: { email }
    });

    if (existingVerification) {
      // Update existing record
      await prisma.emailVerification.update({
        where: { email },
        data: {
          code: verificationCode,
          expiresAt,
          verified: false
        }
      });
    } else {
      // Create new record
      await prisma.emailVerification.create({
        data: {
          email,
          code: verificationCode,
          expiresAt,
          verified: false
        }
      });
    }

    // Send email
    await emailService.sendVerificationEmail(email, verificationCode);

    res.json({
      success: true,
      message: 'Verification code sent to your email'
    });
  } catch (error) {
    console.error('Error sending verification code:', error);
    res.status(500).json({ error: error.message || 'Failed to send verification code' });
  }
};

/**
 * Verify email with code
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find verification record
    const verification = await prisma.emailVerification.findUnique({
      where: { email }
    });

    if (!verification) {
      return res.status(400).json({ error: 'No verification request found for this email' });
    }

    // Check if code matches
    if (verification.code !== code) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check if code expired
    if (new Date() > verification.expiresAt) {
      return res.status(400).json({ error: 'Verification code expired. Please request a new one' });
    }

    // Mark as verified
    await prisma.emailVerification.update({
      where: { email },
      data: { verified: true }
    });

    res.json({
      success: true,
      message: 'Email verified successfully. You can now complete your registration.'
    });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ error: error.message || 'Failed to verify email' });
  }
};

/**
 * Complete registration after email verification
 */
export const completeRegistration = async (req, res) => {
  try {
    const { email, name, password, contact } = req.body;

    // Validate input
    if (!email || !name || !password || !contact) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if email is verified
    const verification = await prisma.emailVerification.findUnique({
      where: { email }
    });

    if (!verification || !verification.verified) {
      return res.status(400).json({ error: 'Email not verified. Please verify your email first.' });
    }

    // Register user
    const result = await authService.registerUser(email, name, password, contact);
    const { token, ...userData } = result;

    // Clean up verification record
    await prisma.emailVerification.delete({
      where: { email }
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Don't fail the registration if welcome email fails
    }

    res.status(201).json({
      success: true,
      token,
      data: userData
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
