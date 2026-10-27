const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get dashboard statistics for an Organizer (Real database calculations)
// @route   GET /api/organizer/dashboard/stats
// @access  Private (Organizer only)
const getOrganizerDashboardStats = async (req, res, next) => {
  try {
    const organizerId = req.user._id;

    // Fetch all events by this organizer
    const events = await Event.find({ organizer: organizerId }).lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const totalEvents = events.length;
    let publishedCount = 0;
    let cancelledCount = 0;
    let completedCount = 0;
    let upcomingCount = 0;
    let totalCapacity = 0;
    let totalActiveRegistrations = 0;

    const categoryMap = {};
    const chartData = [];

    events.forEach((ev) => {
      if (ev.status === 'published') publishedCount++;
      if (ev.status === 'cancelled') cancelledCount++;
      if (ev.status === 'completed') completedCount++;

      if (new Date(ev.date) >= startOfToday && ev.status !== 'cancelled') {
        upcomingCount++;
      }

      totalCapacity += ev.capacity || 0;
      totalActiveRegistrations += ev.registeredCount || 0;

      // Category breakdown
      categoryMap[ev.category] = (categoryMap[ev.category] || 0) + 1;

      // Event registrations for chart (top/recent 7)
      chartData.push({
        id: ev._id,
        name: ev.title.length > 18 ? ev.title.substring(0, 18) + '...' : ev.title,
        registered: ev.registeredCount || 0,
        capacity: ev.capacity || 0,
        occupancyRate: ev.capacity > 0 ? Math.round(((ev.registeredCount || 0) / ev.capacity) * 100) : 0
      });
    });

    const overallOccupancyRate = totalCapacity > 0
      ? Math.round((totalActiveRegistrations / totalCapacity) * 100)
      : 0;

    const categoryDistribution = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      count: categoryMap[cat]
    }));

    // Fetch recent 5 registrations across this organizer's events
    const eventIds = events.map((ev) => ev._id);
    const recentRegistrations = await Registration.find({
      event: { $in: eventIds }
    })
      .populate('participant', 'name email')
      .populate('event', 'title date')
      .sort({ registeredAt: -1 })
      .limit(5)
      .lean();

    return res.status(200).json({
      success: true,
      stats: {
        totalEvents,
        publishedCount,
        cancelledCount,
        completedCount,
        upcomingCount,
        totalCapacity,
        totalActiveRegistrations,
        overallOccupancyRate
      },
      chartData: chartData.slice(0, 8),
      categoryDistribution,
      recentRegistrations
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard statistics for a Participant (Real database calculations)
// @route   GET /api/participant/dashboard/stats
// @access  Private (Participant only)
const getParticipantDashboardStats = async (req, res, next) => {
  try {
    const participantId = req.user._id;

    const registrations = await Registration.find({ participant: participantId })
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email' }
      })
      .sort({ registeredAt: -1 })
      .lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let totalRegistrations = 0;
    let upcomingCount = 0;
    let pastCount = 0;
    let cancelledCount = 0;
    let nextUpcomingEvent = null;

    const validRegistrations = registrations.filter((reg) => reg.event != null);

    validRegistrations.forEach((reg) => {
      totalRegistrations++;

      if (reg.status === 'cancelled') {
        cancelledCount++;
      } else {
        const evDate = new Date(reg.event.date);
        if (evDate >= startOfToday) {
          upcomingCount++;
          if (!nextUpcomingEvent || evDate < new Date(nextUpcomingEvent.date)) {
            nextUpcomingEvent = reg.event;
          }
        } else {
          pastCount++;
        }
      }
    });

    const recentRegistrations = validRegistrations.slice(0, 5);

    return res.status(200).json({
      success: true,
      stats: {
        totalRegistrations,
        upcomingCount,
        pastCount,
        cancelledCount
      },
      nextUpcomingEvent,
      recentRegistrations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrganizerDashboardStats,
  getParticipantDashboardStats
};
