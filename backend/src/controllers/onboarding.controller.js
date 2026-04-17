const { prisma } = require('../db');

// Get onboarding progress
exports.getOnboardingProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId }
      });
    }

    const percentComplete = Math.round(
      (
        (progress.profileSetup ? 1 : 0) +
        (progress.skillsAdded ? 1 : 0) +
        (progress.paymentSetup ? 1 : 0) +
        (progress.photoUploaded ? 1 : 0)
      ) / 4 * 100
    );

    res.json({
      success: true,
      data: {
        ...progress,
        percentComplete,
        nextStep: progress.completed ? null : progress.step
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark profile setup as complete
exports.completeProfileSetup = async (req, res) => {
  try {
    const userId = req.user.id;
    const { intent } = req.body; // 'find_work', 'hire_workers', 'sell_products'

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId, profileSetup: true }
      });
    } else {
      progress = await prisma.onboardingProgress.update({
        where: { userId },
        data: { profileSetup: true }
      });
    }

    res.json({ success: true, data: progress, message: 'Profile setup completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark skills as added
exports.completeSkillsSetup = async (req, res) => {
  try {
    const userId = req.user.id;

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId, skillsAdded: true }
      });
    } else {
      progress = await prisma.onboardingProgress.update({
        where: { userId },
        data: { skillsAdded: true }
      });
    }

    res.json({ success: true, data: progress, message: 'Skills setup completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark payment setup as complete
exports.completePaymentSetup = async (req, res) => {
  try {
    const userId = req.user.id;

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId, paymentSetup: true }
      });
    } else {
      progress = await prisma.onboardingProgress.update({
        where: { userId },
        data: { paymentSetup: true }
      });
    }

    res.json({ success: true, data: progress, message: 'Payment setup completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark photo upload as complete
exports.completePhotoUpload = async (req, res) => {
  try {
    const userId = req.user.id;

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId, photoUploaded: true }
      });
    } else {
      progress = await prisma.onboardingProgress.update({
        where: { userId },
        data: { photoUploaded: true }
      });
    }

    res.json({ success: true, data: progress, message: 'Photo upload completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Complete entire onboarding
exports.completeOnboarding = async (req, res) => {
  try {
    const userId = req.user.id;

    const progress = await prisma.onboardingProgress.update({
      where: { userId },
      data: {
        completed: true,
        completedAt: new Date()
      }
    });

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'onboarding_complete',
        title: 'Welcome to HafiHub!',
        message: 'Your profile is all set. Start exploring opportunities!'
      }
    });

    res.json({ success: true, data: progress, message: 'Onboarding completed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Skip a step
exports.skipStep = async (req, res) => {
  try {
    const userId = req.user.id;
    const { step } = req.body;

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId }
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId }
      });
    }

    const skipped = progress.skippedSteps ? JSON.parse(progress.skippedSteps) : [];
    if (!skipped.includes(step)) {
      skipped.push(step);
    }

    progress = await prisma.onboardingProgress.update({
      where: { userId },
      data: { skippedSteps: JSON.stringify(skipped) }
    });

    res.json({ success: true, data: progress, message: `Step ${step} skipped` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
