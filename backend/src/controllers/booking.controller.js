import prisma from '../utils/db.js';
import * as eventPaymentService from '../services/event-payment.service.js';

export async function listBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        event: {
          include: { user: { select: { id: true, name: true } } }
        },
        transaction: true
      },
      orderBy: { bookedAt: 'desc' }
    });

    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createBooking(req, res) {
  try {
    const { eventId } = req.body;
    const userId = req.user.id;

    if (!eventId) {
      return res.status(400).json({ success: false, error: 'Event ID required' });
    }

    const event = await prisma.event.findUnique({
      where: { id: parseInt(eventId) }
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.booked >= event.capacity) {
      return res.status(400).json({ success: false, error: 'Event is full' });
    }

    const existing = await prisma.booking.findFirst({
      where: { eventId: parseInt(eventId), userId }
    });

    if (existing) {
      return res.status(400).json({ success: false, error: 'Already booked' });
    }

    let result;

    // Handle free events
    if (!event.isPaid) {
      result = await eventPaymentService.processBookingForFreeEvent(parseInt(eventId), userId);
      
      // Update booked count
      await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: { booked: { increment: 1 } }
      });

      return res.status(201).json({
        success: true,
        data: result.booking,
        message: result.message
      });
    } else {
      // Handle paid events
      result = await eventPaymentService.processBookingForPaidEvent(parseInt(eventId), userId);
      
      // Update booked count
      await prisma.event.update({
        where: { id: parseInt(eventId) },
        data: { booked: { increment: 1 } }
      });

      return res.status(201).json({
        success: true,
        data: result.booking,
        message: result.message,
        paymentRequired: result.paymentRequired
      });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * Complete payment for a paid event booking
 */
export async function completePayment(req, res) {
  try {
    const { bookingId, transactionId, amountPaid } = req.body;
    const userId = req.user.id;

    if (!bookingId || !transactionId || !amountPaid) {
      return res.status(400).json({
        success: false,
        error: 'bookingId, transactionId, and amountPaid are required'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const result = await eventPaymentService.completePaymentForBooking(
      parseInt(bookingId),
      parseInt(transactionId),
      parseFloat(amountPaid)
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

/**
 * Handle payment failure for a booking
 */
export async function handlePaymentFailure(req, res) {
  try {
    const { bookingId, reason } = req.body;
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        error: 'bookingId is required'
      });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const result = await eventPaymentService.handlePaymentFailure(
      parseInt(bookingId),
      reason || 'Payment processing failed'
    );

    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}

export async function cancelBooking(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) }
    });

    if (!booking) {
      return res.status(404).json({ success: false, error: 'Booking not found' });
    }

    if (booking.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Check if booking has completed payment - if so, process refund
    if (booking.paymentStatus === 'completed') {
      try {
        await eventPaymentService.refundBookingPayment(parseInt(id), 'User cancelled booking');
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        // Continue with cancellation even if refund processing fails
      }
    }

    const eventId = booking.eventId;

    await prisma.booking.delete({ where: { id: parseInt(id) } });

    // Update booked count
    await prisma.event.update({
      where: { id: eventId },
      data: { booked: { decrement: 1 } }
    });

    res.json({ success: true, message: 'Booking cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
