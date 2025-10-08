import { body, validationResult } from 'express-validator';
import Event from '../models/Event.js';
import User from '../models/User.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { status, type, search, organizerId, format } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.eventType = type;
    if (format) filter.eventFormat = format;
    if (organizerId) {
      filter.$or = [
        { organizer: organizerId },
        { 'coOrganizers.faculty': organizerId }
      ];
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { abstract: { $regex: search, $options: 'i' } }
      ];
    }

    // Public access - show all events for demonstration
    // filter.status = { $in: ['Approved', 'Completed'] };

    // Get events with pagination
    const events = await Event.find(filter)
      .populate('organizer', 'firstName lastName email department')
      .populate('coOrganizers.faculty', 'firstName lastName email department')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count
    const total = await Event.countDocuments(filter);

    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalEvents: total,
          hasNextPage: page < Math.ceil(total / limit),
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Private
export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'firstName lastName email department')
      .populate('coOrganizers.faculty', 'firstName lastName email department');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    res.json({
      success: true,
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Get event by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
};

// @desc    Create new event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title,
      description,
      eventType,
      eventFormat,
      startDate,
      endDate,
      startTime,
      endTime,
      keywords
    } = req.body;

    const eventData = {
      title,
      description,
      eventType,
      eventFormat,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      startTime,
      endTime,
      keywords,
      organizer: req.user._id
    };

    // Create event
    const event = await Event.create(eventData);

    // Populate the created event
    await event.populate([
      { path: 'organizer', select: 'firstName lastName email department' },
      { path: 'coOrganizers.faculty', select: 'firstName lastName email department' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Create event error:', error?.message || error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.values(error.errors).map((e) => ({ msg: e.message }))
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating event'
    });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can update this event
    const canUpdate = req.user.role === 'admin' || 
                     event.isFacultyOrganizer(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update events you organize'
      });
    }

    // Update event
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'organizer', select: 'firstName lastName email department' },
      { path: 'coOrganizers.faculty', select: 'firstName lastName email department' }
    ]);

    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating event'
    });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can delete this event
    const canDelete = req.user.role === 'admin' || 
                     event.organizer.toString() === req.user._id.toString();

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete events you organize'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
};

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
export const registerForEvent = async (req, res) => {
  try {
    const { name, email, affiliation } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if registration is required
    if (!event.registration.isRequired) {
      return res.status(400).json({
        success: false,
        message: 'Registration is not required for this event'
      });
    }

    // Check if registration deadline has passed
    if (event.registration.registrationDeadline && new Date() > event.registration.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }

    // Check if already registered
    const alreadyRegistered = event.participants.some(participant => 
      participant.email === email
    );

    if (alreadyRegistered) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered for this event'
      });
    }

    // Check if max participants reached
    if (event.registration.maxParticipants && 
        event.participants.length >= event.registration.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'Maximum participants reached'
      });
    }

    // Add participant
    event.participants.push({
      name: name || `${req.user.firstName} ${req.user.lastName}`,
      email: email || req.user.email,
      affiliation: affiliation || req.user.department,
      registrationDate: new Date()
    });

    await event.save();

    res.json({
      success: true,
      message: 'Successfully registered for the event',
      data: {
        participant: event.participants[event.participants.length - 1]
      }
    });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while registering for event'
    });
  }
};

// @desc    Update attendance
// @route   PUT /api/events/:id/attendance
// @access  Private
export const updateAttendance = async (req, res) => {
  try {
    const { participantId, attendanceStatus } = req.body;

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Check if user can update attendance
    const canUpdate = req.user.role === 'admin' || 
                     event.isFacultyOrganizer(req.user._id);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update attendance for events you organize'
      });
    }

    // Find and update participant
    const participant = event.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({
        success: false,
        message: 'Participant not found'
      });
    }

    participant.attendanceStatus = attendanceStatus;
    await event.save();

    res.json({
      success: true,
      message: 'Attendance updated successfully',
      data: {
        participant
      }
    });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating attendance'
    });
  }
};

// @desc    Get event statistics
// @route   GET /api/events/stats
// @access  Private
export const getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const completedEvents = await Event.countDocuments({ status: 'Completed' });
    const upcomingEvents = await Event.countDocuments({ 
      status: { $in: ['Planned', 'Scheduled'] }
    });
    const ongoingEvents = await Event.countDocuments({ status: 'Ongoing' });
    
    // Get events by type
    const eventsByType = await Event.aggregate([
      { $group: { _id: '$eventType', count: { $sum: 1 } } }
    ]);

    // Get events by format
    const eventsByFormat = await Event.aggregate([
      { $group: { _id: '$eventFormat', count: { $sum: 1 } } }
    ]);

    // Get total participants
    const totalParticipants = await Event.aggregate([
      { $group: { _id: null, total: { $sum: { $size: '$participants' } } } }
    ]);

    // Get recent events (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentEvents = await Event.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalEvents,
        completedEvents,
        upcomingEvents,
        ongoingEvents,
        eventsByType,
        eventsByFormat,
        totalParticipants: totalParticipants[0]?.total || 0,
        recentEvents
      }
    });
  } catch (error) {
    console.error('Get event stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event statistics'
    });
  }
};

// @desc    Approve event
// @route   PUT /api/events/:id/approve
// @access  Private (Admin only)
export const approveEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.status = 'Approved';
    event.reviewedBy = req.user._id;
    event.reviewComments = comments;
    event.approvedDate = new Date();

    await event.save();

    res.json({
      success: true,
      message: 'Event approved successfully',
      data: { event }
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving event'
    });
  }
};

// @desc    Reject event
// @route   PUT /api/events/:id/reject
// @access  Private (Admin only)
export const rejectEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const { comments } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    event.status = 'Rejected';
    event.reviewedBy = req.user._id;
    event.reviewComments = comments;
    event.rejectedDate = new Date();

    await event.save();

    res.json({
      success: true,
      message: 'Event rejected',
      data: { event }
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting event'
    });
  }
};
