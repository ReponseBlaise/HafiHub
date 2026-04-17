const { prisma } = require('../db');

// Create or update payment profile
exports.createPaymentProfile = async (req, res) => {
  try {
    const { paymentMethod, phoneNumber } = req.body;
    const userId = req.user.id;

    const validMethods = ['mtn', 'airtel'];
    if (!validMethods.includes(paymentMethod.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Invalid payment method. Supported: mtn, airtel' });
    }

    let profile = await prisma.paymentProfile.findUnique({ where: { userId } });

    if (profile) {
      profile = await prisma.paymentProfile.update({
        where: { userId },
        data: { paymentMethod: paymentMethod.toLowerCase(), phoneNumber }
      });
    } else {
      profile = await prisma.paymentProfile.create({
        data: { userId, paymentMethod: paymentMethod.toLowerCase(), phoneNumber }
      });
    }

    res.json({ success: true, data: profile, message: 'Payment profile created/updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment profile
exports.getPaymentProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.paymentProfile.findUnique({ where: { userId } });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Payment profile not found' });
    }

    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Initiate payment verification (OTP)
exports.initiateVerification = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = await prisma.paymentProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Payment profile not found' });
    }

    if (profile.verificationAttempts >= 3) {
      return res.status(429).json({ success: false, message: 'Too many verification attempts. Try again later.' });
    }

    // TODO: Implement actual OTP sending via MTN/Airtel API
    // For now, generate a mock OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.paymentProfile.update({
      where: { userId },
      data: {
        verificationCode: otp,
        verificationAttempts: profile.verificationAttempts + 1
      }
    });

    // TODO: Send OTP via SMS to profile.phoneNumber
    // In production: call MTN/Airtel SMS API

    res.json({
      success: true,
      message: 'OTP sent to your registered phone number',
      // In production, don't send OTP back
      _debug_otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify payment profile with OTP
exports.verifyPaymentProfile = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user.id;

    const profile = await prisma.paymentProfile.findUnique({ where: { userId } });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Payment profile not found' });
    }

    if (profile.verificationCode !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const updated = await prisma.paymentProfile.update({
      where: { userId },
      data: {
        verified: true,
        verificationCode: null,
        verificationAttempts: 0,
        lastVerificationAt: new Date()
      }
    });

    res.json({ success: true, data: updated, message: 'Payment profile verified' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Make a payment
exports.makePayment = async (req, res) => {
  try {
    const { amount, recipientUserId, jobId, currency = 'RWF' } = req.body;
    const userId = req.user.id;

    const profile = await prisma.paymentProfile.findUnique({ where: { userId } });
    if (!profile || !profile.verified) {
      return res.status(400).json({ success: false, message: 'Payment profile not verified' });
    }

    // TODO: Implement actual payment processing via MTN/Airtel API
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: 'payment_sent',
        amount: parseFloat(amount),
        currency,
        status: 'pending',
        jobId: jobId ? parseInt(jobId) : null,
        externalId: `TXN_${Date.now()}`
      }
    });

    // TODO: Call MTN/Airtel payment API
    // On success: update transaction.status to 'completed'
    // On failure: update transaction.status to 'failed'

    res.json({
      success: true,
      data: transaction,
      message: 'Payment initiated. Please confirm on your phone.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction history
exports.getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, type } = req.query;

    const skip = (page - 1) * limit;

    const where = { userId };
    if (type) where.type = type;

    const transactions = await prisma.transaction.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.transaction.count({ where });

    res.json({
      success: true,
      data: transactions,
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get transaction details
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const transaction = await prisma.transaction.findUnique({
      where: { id: parseInt(id) }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    res.json({ success: true, data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Webhook for payment confirmation (MTN/Airtel)
exports.paymentWebhook = async (req, res) => {
  try {
    const { externalId, status } = req.body;

    // TODO: Verify webhook signature from MTN/Airtel

    const transaction = await prisma.transaction.findFirst({
      where: { externalId }
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    await prisma.transaction.update({
      where: { id: transaction.id },
      data: { status }
    });

    // TODO: Create notification for user
    // TODO: Update job status if payment completed

    res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
