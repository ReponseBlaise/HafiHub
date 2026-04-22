import prisma from '../utils/db.js';

export async function listEvents(req, res) {
  try {
    const { page = 1, limit = 10, category, location } = req.query;
    const skip = (page - 1) * limit;

    const where = {};
    if (category) where.category = category;
    if (location) where.location = location;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: { user: { select: { id: true, name: true, email: true } } },
        skip,
        take: parseInt(limit),
        orderBy: { eventDate: 'asc' }
      }),
      prisma.event.count({ where })
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getEvent(req, res) {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        bookings: { include: { user: { select: { id: true, name: true } } } }
      }
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    res.json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function createEvent(req, res) {
  try {
    const { title, description, category, location, eventDate, capacity, imageUrl, isPaid, amount, currency } = req.body;
    const userId = req.user.id;

    if (!title || !description || !category || !location || !eventDate || !capacity) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Validate paid event fields
    if (isPaid && (!amount || amount <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'For paid events, amount must be greater than 0'
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        category,
        location,
        eventDate: new Date(eventDate),
        capacity: parseInt(capacity),
        imageUrl: imageUrl || null,
        userId,
        isPaid: isPaid || false,
        amount: isPaid ? parseFloat(amount) : null,
        currency: isPaid ? (currency || 'RWF') : 'RWF'
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.status(201).json({ success: true, data: event });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateEvent(req, res) {
  try {
    const { id } = req.params;
    const { title, description, category, location, eventDate, capacity, imageUrl, isPaid, amount, currency } = req.body;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Validate paid event fields
    const willBePaid = isPaid !== undefined ? isPaid : event.isPaid;
    const willHaveAmount = amount !== undefined ? amount : event.amount;
    
    if (willBePaid && (!willHaveAmount || willHaveAmount <= 0)) {
      return res.status(400).json({
        success: false,
        error: 'For paid events, amount must be greater than 0'
      });
    }

    const updated = await prisma.event.update({
      where: { id: parseInt(id) },
      data: {
        title: title || event.title,
        description: description || event.description,
        category: category || event.category,
        location: location || event.location,
        eventDate: eventDate ? new Date(eventDate) : event.eventDate,
        capacity: capacity ? parseInt(capacity) : event.capacity,
        imageUrl: imageUrl !== undefined ? imageUrl : event.imageUrl,
        isPaid: isPaid !== undefined ? isPaid : event.isPaid,
        amount: isPaid !== undefined ? (isPaid ? parseFloat(amount) : null) : event.amount,
        currency: isPaid !== undefined ? (isPaid ? (currency || 'RWF') : 'RWF') : event.currency
      },
      include: { user: { select: { id: true, name: true, email: true } } }
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteEvent(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({ where: { id: parseInt(id) } });
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    if (event.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await prisma.event.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get all events hosted by the current user
export async function getHostEvents(req, res) {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where: { userId },
        include: {
          user: { select: { id: true, name: true, email: true, contact: true } },
          bookings: { include: { user: { select: { id: true, name: true, email: true, contact: true } } } }
        },
        skip,
        take: parseInt(limit),
        orderBy: { eventDate: 'asc' }
      }),
      prisma.event.count({ where: { userId } })
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

// Get bookings for a specific event (only for the event host)
export async function getEventBookings(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await prisma.event.findUnique({
      where: { id: parseInt(id) },
      include: {
        bookings: {
          include: {
            user: { select: { id: true, name: true, email: true, contact: true, location: true } }
          },
          orderBy: { bookedAt: 'desc' }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }

    // Check if user is the event host
    if (event.userId !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to view bookings for this event' });
    }

    res.json({
      success: true,
      data: {
        event: {
          id: event.id,
          title: event.title,
          eventDate: event.eventDate,
          capacity: event.capacity,
          booked: event.booked
        },
        bookings: event.bookings
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
