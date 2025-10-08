import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  updateAttendance,
  getEventStats,
  approveEvent,
  rejectEvent
} from '../controllers/eventController.js';
import {
  body,
  validationResult
} from 'express-validator';

const router = express.Router();

// Validation middleware for event creation/update
const eventValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('eventType')
    .isIn(['Seminar', 'Workshop', 'Conference', 'Symposium', 'Training', 'Webinar', 'Other'])
    .withMessage('Invalid event type'),
  body('eventFormat')
    .isIn(['Physical', 'Online', 'Hybrid'])
    .withMessage('Invalid event format'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('startTime')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Start time must be between 1 and 20 characters'),
  body('endTime')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('End time must be between 1 and 20 characters'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
];

// Validation middleware for event registration
const registrationValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('affiliation')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Affiliation must be between 2 and 100 characters')
];

// Validation middleware for attendance update
const attendanceValidation = [
  body('participantId')
    .isMongoId()
    .withMessage('Invalid participant ID'),
  body('attendanceStatus')
    .isIn(['Registered', 'Attended', 'Absent'])
    .withMessage('Invalid attendance status')
];

// Apply routes with no authentication for public access
router.get('/', getEvents);
router.get('/stats', getEventStats);
router.get('/:id', getEventById);
router.post('/', authenticate, eventValidation, createEvent);
router.put('/:id', authenticate, eventValidation, updateEvent);
router.delete('/:id', authenticate, deleteEvent);
router.post('/:id/register', authenticate, registrationValidation, registerForEvent);
router.put('/:id/attendance', authenticate, attendanceValidation, updateAttendance);
router.put('/:id/approve', authenticate, authorize('admin'), approveEvent);
router.put('/:id/reject', authenticate, authorize('admin'), rejectEvent);

export default router;
