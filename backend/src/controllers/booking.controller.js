import prisma from '../utils/db.js';

export async function listBookings(req, res) {
  try {
    const userId = req.user.id;
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        event: {
          include: { user: { select: { id: true, name: true } } }
        }
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

    const booking = await prisma.booking.create({
      data: { eventId: parseInt(eventId), userId },
      include: {
        event: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    // Update booked count
    await prisma.event.update({
      where: { id: parseInt(eventId) },
      data: { booked: { increment: 1 } }
    });

    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
