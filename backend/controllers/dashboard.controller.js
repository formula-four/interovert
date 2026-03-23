import Event            from '../models/Event.js';
import EventParticipant from '../models/EventParticipant.js';

/**
 * GET /api/dashboard/stats
 * Returns KPI summary + per-event breakdown for the logged-in host.
 */
export async function getDashboardStats(req, res) {
  const userId = req.user._id;

  // All events owned by this user, sorted newest first
  const events = await Event.find({ owner_id: userId })
    .populate('address')
    .sort({ createdAt: -1 })
    .lean();

  const eventIds = events.map((e) => e._id);

  // All participants across all these events
  const participants = await EventParticipant.find({ event_id: { $in: eventIds } }).lean();

  // ── KPIs ──────────────────────────────────────────────────────────────────
  const totalEvents       = events.length;
  const totalParticipants = participants.filter((p) => p.paymentStatus !== 'pending' && p.paymentStatus !== 'failed').length;
  const totalRevenue      = participants
    .filter((p) => p.paymentStatus === 'paid')
    .reduce((sum, p) => sum + (p.amountPaid || 0), 0);

  // ── Per-event breakdown ───────────────────────────────────────────────────
  const eventStats = events.map((event) => {
    const ep      = participants.filter((p) => String(p.event_id) === String(event._id));
    const paid    = ep.filter((p) => p.paymentStatus === 'paid');
    const free    = ep.filter((p) => p.paymentStatus === 'free');
    const pending = ep.filter((p) => p.paymentStatus === 'pending');
    const failed  = ep.filter((p) => p.paymentStatus === 'failed');
    const revenue = paid.reduce((s, p) => s + (p.amountPaid || 0), 0);

    return {
      _id:              event._id,
      name:             event.name,
      photo:            event.photo || null,
      datetime:         event.datetime,
      category:         event.category,
      ticketPrice:      event.ticketPrice || 0,
      maxAttendees:     event.maxAttendees,
      participantCount: paid.length + free.length,
      paidCount:        paid.length,
      freeCount:        free.length,
      pendingCount:     pending.length,
      failedCount:      failed.length,
      revenue,
      address: event.address
        ? {
            city:    event.address.city,
            line1:   event.address.line1,
            country: event.address.country,
          }
        : null,
      createdAt: event.createdAt,
    };
  });

  return res.json({
    stats: { totalEvents, totalParticipants, totalRevenue },
    events: eventStats,
  });
}

/**
 * GET /api/dashboard/events/:eventId/participants
 * Returns participants for a specific event (owner only), with payment info.
 */
export async function getDashboardEventParticipants(req, res) {
  const event = await Event.findById(req.params.eventId);
  if (!event) return res.status(404).json({ message: 'Event not found' });

  if (String(event.owner_id) !== String(req.user._id)) {
    return res.status(403).json({ message: 'Not authorized' });
  }

  const participants = await EventParticipant.find({ event_id: event._id })
    .sort({ joinedAt: 1 })
    .lean();

  return res.json({
    eventName:   event.name,
    ticketPrice: event.ticketPrice || 0,
    participants,
  });
}
