import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import postRoutes from './routes/post.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from './routes/like.routes.js';
import userRoutes from './routes/user.routes.js';
import eventRoutes from './routes/event.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import newsRoutes from './routes/news.routes.js';
import reviewRoutes from './routes/review.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import jobRoutes from './routes/job.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import onboardingRoutes from './routes/onboarding.routes.js';
import utilityRoutes from './routes/utility.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/comments', commentRoutes);
app.use('/likes', likeRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/bookings', bookingRoutes);
app.use('/news', newsRoutes);
app.use('/reviews', reviewRoutes);
app.use('/notifications', notificationRoutes);
app.use('/jobs', jobRoutes);
app.use('/payments', paymentRoutes);
app.use('/onboarding', onboardingRoutes);
app.use('/utility', utilityRoutes);
app.use('/analytics', analyticsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 HafiHub backend running on http://localhost:${PORT}`);
});

export default app;
