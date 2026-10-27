const mongoose = require('mongoose');
const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all public events with search, filter, sort & pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res, next) => {
  try {
    const {
      search,
      category,
      status,
      dateFilter,
      startDate,
      endDate,
      eventType,
      sort,
      page = 1,
      limit = 9
    } = req.query;

    const query = {};

    // By default, public listing displays all events or can filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Event type filter (online/offline)
    if (eventType && eventType !== 'all') {
      query.eventType = eventType;
    }

    // Text search on title, description, and location
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: regex },
        { description: regex },
        { location: regex }
      ];
    }

    // Date filters
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (dateFilter === 'today') {
      query.date = { $gte: startOfToday, $lte: endOfToday };
    } else if (dateFilter === 'upcoming') {
      query.date = { $gte: startOfToday };
    } else if (dateFilter === 'past') {
      query.date = { $lt: startOfToday };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Sorting
    let sortOption = { date: 1 }; // default: earliest upcoming first
    if (sort === 'date_desc') {
      sortOption = { date: -1 };
    } else if (sort === 'date_asc') {
      sortOption = { date: 1 };
    } else if (sort === 'created_desc') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'capacity_desc') {
      sortOption = { capacity: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .populate('organizer', 'name email')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Map remaining seats and sanitize meetingUrl for public listing
    const sanitizedEvents = events.map((ev) => {
      const { meetingUrl, ...rest } = ev;
      return {
        ...rest,
        remainingSeats: Math.max(0, ev.capacity - (ev.registeredCount || 0)),
        isFull: (ev.registeredCount || 0) >= ev.capacity
      };
    });

    return res.status(200).json({
      success: true,
      count: sanitizedEvents.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      events: sanitizedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public (with optional user context)
const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid event ID format'
      });
    }

    const event = await Event.findById(id).populate('organizer', 'name email');
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    const eventObj = event.toObject();
    eventObj.remainingSeats = Math.max(0, event.capacity - (event.registeredCount || 0));
    eventObj.isFull = (event.registeredCount || 0) >= event.capacity;

    let isUserRegistered = false;
    let registrationDetails = null;

    // If a user is logged in, check their registration status
    if (req.user) {
      const registration = await Registration.findOne({
        event: event._id,
        participant: req.user._id,
        status: 'registered'
      });

      if (registration) {
        isUserRegistered = true;
        registrationDetails = registration;
      }
    }

    const isOwner = req.user && event.organizer && event.organizer._id.toString() === req.user._id.toString();

    // Hide meeting URL if user is not the organizer and not a registered participant
    if (!isUserRegistered && !isOwner) {
      delete eventObj.meetingUrl;
    }

    return res.status(200).json({
      success: true,
      event: eventObj,
      isUserRegistered,
      registrationDetails,
      isOwner
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new event
// @route   POST /api/events
// @access  Private (Organizer only)
const createEvent = async (req, res, next) => {
  try {
    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      eventType,
      meetingUrl,
      coverImage,
      capacity
    } = req.body;

    const event = await Event.create({
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      eventType: eventType || 'offline',
      meetingUrl: meetingUrl || '',
      coverImage: coverImage || '',
      capacity: Number(capacity),
      registeredCount: 0,
      status: 'published',
      organizer: req.user._id
    });

    const populatedEvent = await Event.findById(event._id).populate('organizer', 'name email');

    return res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: populatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing event
// @route   PUT /api/events/:id
// @access  Private (Organizer only, owner enforced)
const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Enforce organizer ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to modify this event'
      });
    }

    const {
      title,
      description,
      category,
      date,
      startTime,
      endTime,
      location,
      eventType,
      meetingUrl,
      coverImage,
      capacity,
      status
    } = req.body;

    // Enforce capacity rule: cannot reduce capacity below existing active registrations
    if (capacity !== undefined && capacity !== null) {
      const newCapacity = Number(capacity);
      if (newCapacity < event.registeredCount) {
        return res.status(400).json({
          success: false,
          message: `Cannot reduce capacity to ${newCapacity}. Event already has ${event.registeredCount} active registration(s).`
        });
      }
      event.capacity = newCapacity;
    }

    if (title) event.title = title;
    if (description) event.description = description;
    if (category) event.category = category;
    if (date) event.date = date;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (location) event.location = location;
    if (eventType) event.eventType = eventType;
    if (meetingUrl !== undefined) event.meetingUrl = meetingUrl;
    if (coverImage !== undefined) event.coverImage = coverImage;
    if (status) event.status = status;

    await event.save();
    const updatedEvent = await Event.findById(id).populate('organizer', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      event: updatedEvent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an event
// @route   PATCH /api/events/:id/cancel
// @access  Private (Organizer only, owner enforced)
const cancelEvent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Enforce organizer ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to cancel this event'
      });
    }

    if (event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Event is already cancelled'
      });
    }

    event.status = 'cancelled';
    await event.save();

    return res.status(200).json({
      success: true,
      message: 'Event has been cancelled successfully',
      event
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all events created by the logged-in organizer
// @route   GET /api/organizer/events
// @access  Private (Organizer only)
const getOrganizerEvents = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = { organizer: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: regex }, { description: regex }, { location: regex }];
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const formattedEvents = events.map((ev) => ({
      ...ev,
      remainingSeats: Math.max(0, ev.capacity - (ev.registeredCount || 0)),
      isFull: (ev.registeredCount || 0) >= ev.capacity
    }));

    return res.status(200).json({
      success: true,
      count: formattedEvents.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      events: formattedEvents
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get participants list for an organizer's event
// @route   GET /api/organizer/events/:id/participants
// @access  Private (Organizer only, owner enforced)
const getEventParticipants = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, search } = req.query;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Enforce organizer ownership
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view participants for this event'
      });
    }

    const query = { event: id };
    if (status && status !== 'all') {
      query.status = status;
    }

    let registrations = await Registration.find(query)
      .populate('participant', 'name email')
      .sort({ registeredAt: -1 })
      .lean();

    // If search keyword provided, filter by participant name or email
    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      registrations = registrations.filter(
        (reg) =>
          reg.participant &&
          (reg.participant.name.toLowerCase().includes(term) ||
            reg.participant.email.toLowerCase().includes(term))
      );
    }

    return res.status(200).json({
      success: true,
      count: registrations.length,
      event: {
        id: event._id,
        title: event.title,
        capacity: event.capacity,
        registeredCount: event.registeredCount,
        remainingSeats: Math.max(0, event.capacity - event.registeredCount),
        status: event.status
      },
      participants: registrations
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  getOrganizerEvents,
  getEventParticipants
};
