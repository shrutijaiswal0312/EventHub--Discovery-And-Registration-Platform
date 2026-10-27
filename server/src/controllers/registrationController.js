const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Register the logged-in participant for an event (Concurrency-safe)
// @route   POST /api/events/:id/register
// @access  Private (Participant only)
const registerForEvent = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const participantId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Rule: Organizers cannot register for their own events
    if (event.organizer.toString() === participantId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Organizers cannot register as participants for their own events.'
      });
    }

    // Rule: Cancelled events cannot accept new registrations
    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This event has been cancelled and is not accepting registrations.'
      });
    }

    // Rule: Completed events cannot accept new registrations
    if (event.status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'This event has already ended and is not accepting registrations.'
      });
    }

    // Rule: Past events cannot accept new registrations
    const now = new Date();
    const eventDate = new Date(event.date);
    // If event date is strictly before today (00:00)
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (eventDate < startOfToday) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for an event that has already occurred.'
      });
    }

    // Check existing registration
    const existingRegistration = await Registration.findOne({
      participant: participantId,
      event: eventId
    });

    // Rule: A participant cannot register twice for the same event
    if (existingRegistration && existingRegistration.status === 'registered') {
      return res.status(400).json({
        success: false,
        message: 'You are already actively registered for this event.'
      });
    }

    // Atomic capacity reservation to prevent race conditions & overbooking
    // Ensures registeredCount is strictly less than capacity at the moment of update
    const updatedEvent = await Event.findOneAndUpdate(
      {
        _id: eventId,
        status: 'published',
        $expr: { $lt: ['$registeredCount', '$capacity'] }
      },
      { $inc: { registeredCount: 1 } },
      { new: true }
    );

    if (!updatedEvent) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed. Event is already at full capacity.'
      });
    }

    let registration;

    try {
      if (existingRegistration) {
        // Reactivate previously cancelled registration
        existingRegistration.status = 'registered';
        existingRegistration.registeredAt = new Date();
        existingRegistration.cancelledAt = null;
        await existingRegistration.save();
        registration = existingRegistration;
      } else {
        // Create new registration record
        registration = await Registration.create({
          participant: participantId,
          event: eventId,
          status: 'registered',
          registeredAt: new Date()
        });
      }
    } catch (saveError) {
      // Rollback the atomically reserved seat if record saving failed
      await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: -1 } });
      return next(saveError);
    }

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your seat has been confirmed.',
      registration,
      event: {
        id: updatedEvent._id,
        title: updatedEvent.title,
        capacity: updatedEvent.capacity,
        registeredCount: updatedEvent.registeredCount,
        remainingSeats: Math.max(0, updatedEvent.capacity - updatedEvent.registeredCount)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an active registration (Releases seat atomically)
// @route   DELETE /api/events/:id/register
// @access  Private (Participant only)
const cancelRegistration = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const participantId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const registration = await Registration.findOne({
      participant: participantId,
      event: eventId,
      status: 'registered'
    });

    if (!registration) {
      return res.status(404).json({
        success: false,
        message: 'No active registration found for this event.'
      });
    }

    // Mark registration as cancelled
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save();

    // Atomically release the seat on Event
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $inc: { registeredCount: -1 } },
      { new: true }
    );

    // Guard against negative counts
    if (updatedEvent && updatedEvent.registeredCount < 0) {
      await Event.findByIdAndUpdate(eventId, { registeredCount: 0 });
    }

    return res.status(200).json({
      success: true,
      message: 'Registration cancelled successfully. Your seat has been released.',
      registration,
      event: updatedEvent
        ? {
            id: updatedEvent._id,
            title: updatedEvent.title,
            capacity: updatedEvent.capacity,
            registeredCount: updatedEvent.registeredCount,
            remainingSeats: Math.max(0, updatedEvent.capacity - updatedEvent.registeredCount)
          }
        : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registrations of the logged-in participant
// @route   GET /api/registrations/my
// @access  Private (Participant only)
const getMyRegistrations = async (req, res, next) => {
  try {
    const participantId = req.user._id;
    const { status, timeline } = req.query;

    const query = { participant: participantId };

    if (status && status !== 'all') {
      query.status = status;
    }

    const registrations = await Registration.find(query)
      .populate({
        path: 'event',
        populate: { path: 'organizer', select: 'name email' }
      })
      .sort({ registeredAt: -1 })
      .lean();

    // Filter out registrations where event might have been deleted, or filter by timeline
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    let filtered = registrations.filter((reg) => reg.event != null);

    if (timeline === 'upcoming') {
      filtered = filtered.filter((reg) => new Date(reg.event.date) >= startOfToday);
    } else if (timeline === 'past') {
      filtered = filtered.filter((reg) => new Date(reg.event.date) < startOfToday);
    }

    const formatted = filtered.map((reg) => ({
      ...reg,
      event: {
        ...reg.event,
        remainingSeats: Math.max(0, reg.event.capacity - (reg.event.registeredCount || 0)),
        isFull: (reg.event.registeredCount || 0) >= reg.event.capacity
      }
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      registrations: formatted
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations
};
