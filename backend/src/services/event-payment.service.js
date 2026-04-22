import prisma from '../utils/db.js';
import {
  sendFreeEventBookingEmail,
  sendPaidEventBookingEmail,
  sendPaymentFailedEmail
} from './email.service.js';

/**
 * Process booking for free events
 */
export const processBookingForFreeEvent = async (eventId, userId) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    // Check if booking already exists
    const existingBooking = await prisma.booking.findFirst({
      where: { eventId, userId }
    });

    if (existingBooking) {
      throw new Error('User already has a booking for this event');
    }

    // Create booking without payment
    const booking = await prisma.booking.create({
      data: {
        eventId,
        userId,
        status: 'confirmed',
        paymentStatus: 'completed'
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true, location: true, isPaid: true, amount: true } }
      }
    });

    // Send confirmation email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await sendFreeEventBookingEmail(
      user.email,
      user.name,
      event.title,
      event.eventDate,
      event.location
    );

    return {
      success: true,
      booking,
      message: 'Booking confirmed. Check your email for confirmation.'
    };
  } catch (error) {
    console.error('Error processing free event booking:', error);
    throw new Error(error.message || 'Failed to process booking');
  }
};

/**
 * Process booking for paid events - Initiate payment
 */
export const processBookingForPaidEvent = async (eventId, userId) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      throw new Error('Event not found');
    }

    if (!event.isPaid) {
      throw new Error('Event is not a paid event');
    }

    // Check if booking already exists
    const existingBooking = await prisma.booking.findFirst({
      where: { eventId, userId }
    });

    if (existingBooking) {
      throw new Error('User already has a booking for this event');
    }

    // Create booking with pending payment status
    const booking = await prisma.booking.create({
      data: {
        eventId,
        userId,
        status: 'confirmed',
        paymentStatus: 'pending'
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true, location: true, isPaid: true, amount: true, currency: true } }
      }
    });

    return {
      success: true,
      booking,
      message: 'Booking created. Please proceed with payment.',
      paymentRequired: {
        amount: event.amount,
        currency: event.currency,
        bookingId: booking.id
      }
    };
  } catch (error) {
    console.error('Error processing paid event booking:', error);
    throw new Error(error.message || 'Failed to process booking');
  }
};

/**
 * Complete payment for an event booking
 */
export const completePaymentForBooking = async (bookingId, transactionId, amountPaid) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true, location: true, isPaid: true, amount: true, currency: true, userId: true } }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.paymentStatus === 'completed') {
      throw new Error('Payment already completed for this booking');
    }

    // Update booking with payment details
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'completed',
        amountPaid,
        transactionId,
        paidAt: new Date()
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true, eventDate: true, location: true, isPaid: true, amount: true, currency: true } }
      }
    });

    // Send payment confirmation email
    await sendPaidEventBookingEmail(
      updatedBooking.user.email,
      updatedBooking.user.name,
      updatedBooking.event.title,
      updatedBooking.event.eventDate,
      updatedBooking.event.location,
      updatedBooking.event.amount,
      updatedBooking.event.currency
    );

    return {
      success: true,
      booking: updatedBooking,
      message: 'Payment successful! Confirmation email sent.'
    };
  } catch (error) {
    console.error('Error completing payment:', error);
    throw new Error(error.message || 'Failed to complete payment');
  }
};

/**
 * Handle payment failure
 */
export const handlePaymentFailure = async (bookingId, reason = 'Payment processing failed') => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update booking with failed status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'failed'
      }
    });

    // Send payment failed email
    await sendPaymentFailedEmail(
      booking.user.email,
      booking.user.name,
      booking.event.title,
      reason
    );

    return {
      success: true,
      message: 'Payment failure notification sent to user.'
    };
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw new Error(error.message || 'Failed to handle payment failure');
  }
};

/**
 * Refund a booking payment
 */
export const refundBookingPayment = async (bookingId, reason = 'User requested refund') => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { select: { id: true, title: true } },
        transaction: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.paymentStatus !== 'completed') {
      throw new Error('Can only refund completed payments');
    }

    // Update booking status
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'refunded',
        status: 'cancelled'
      }
    });

    // Create refund transaction if original transaction exists
    if (booking.transaction) {
      await prisma.transaction.create({
        data: {
          userId: booking.userId,
          type: 'refund',
          amount: booking.amountPaid,
          currency: booking.transaction.currency,
          status: 'completed',
          relatedTransactionId: booking.transactionId,
          metadata: JSON.stringify({ reason, bookingId, eventId: booking.eventId })
        }
      });
    }

    return {
      success: true,
      booking: updatedBooking,
      message: 'Refund processed successfully.'
    };
  } catch (error) {
    console.error('Error refunding payment:', error);
    throw new Error(error.message || 'Failed to refund payment');
  }
};

/**
 * Get booking payment details
 */
export const getBookingPaymentDetails = async (bookingId) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        event: { select: { isPaid: true, amount: true, currency: true, title: true } },
        transaction: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    return {
      success: true,
      data: {
        bookingId: booking.id,
        eventTitle: booking.event.title,
        isPaid: booking.event.isPaid,
        amount: booking.event.amount,
        currency: booking.event.currency,
        amountPaid: booking.amountPaid,
        paymentStatus: booking.paymentStatus,
        paidAt: booking.paidAt,
        transaction: booking.transaction
      }
    };
  } catch (error) {
    console.error('Error getting booking payment details:', error);
    throw new Error(error.message || 'Failed to get payment details');
  }
};
