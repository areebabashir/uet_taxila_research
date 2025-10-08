import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getTravelGrants,
  getTravelGrantById,
  createTravelGrant,
  updateTravelGrant,
  deleteTravelGrant,
  reviewTravelGrant,
  submitPostTravelReport,
  getTravelStats,
  approveTravelGrant,
  rejectTravelGrant
} from '../controllers/travelController.js';
import {
  body,
  validationResult
} from 'express-validator';

const router = express.Router();

// Validation middleware for travel grant creation/update
const travelValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('purpose')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Purpose must be between 10 and 500 characters'),
  body('event.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Event name must be between 2 and 100 characters'),
  body('event.type')
    .isIn(['Conference', 'Workshop', 'Seminar', 'Training', 'Research Visit', 'Collaboration', 'Other'])
    .withMessage('Invalid event type'),
  body('event.startDate')
    .isISO8601()
    .withMessage('Event start date must be a valid date'),
  body('event.endDate')
    .isISO8601()
    .withMessage('Event end date must be a valid date'),
  body('travelDetails.departureDate')
    .isISO8601()
    .withMessage('Departure date must be a valid date'),
  body('travelDetails.returnDate')
    .isISO8601()
    .withMessage('Return date must be a valid date'),
  body('travelDetails.departureCity')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Departure city must be between 2 and 50 characters'),
  body('travelDetails.destinationCity')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Destination city must be between 2 and 50 characters'),
  body('funding.totalAmount')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('funding.fundingAgency.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Funding agency name must be between 2 and 100 characters'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
];

// Validation middleware for travel grant review
const reviewValidation = [
  body('status')
    .isIn(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Completed', 'Cancelled'])
    .withMessage('Invalid status'),
  body('reviewComments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comments cannot exceed 1000 characters')
];

// Validation middleware for post-travel report
const postTravelValidation = [
  body('outcomes')
    .optional()
    .isArray()
    .withMessage('Outcomes must be an array'),
  body('publications')
    .optional()
    .isArray()
    .withMessage('Publications must be an array'),
  body('collaborations')
    .optional()
    .isArray()
    .withMessage('Collaborations must be an array'),
  body('feedback.rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('feedback.comments')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Feedback comments cannot exceed 500 characters')
];

// Apply routes with no authentication for public access
router.get('/', getTravelGrants);
router.get('/stats', getTravelStats);
router.get('/:id', getTravelGrantById);
router.post('/', authenticate, travelValidation, createTravelGrant);
router.put('/:id', authenticate, travelValidation, updateTravelGrant);
router.delete('/:id', authenticate, deleteTravelGrant);
router.put('/:id/review', authenticate, authorize('admin'), reviewValidation, reviewTravelGrant);
router.put('/:id/post-travel', authenticate, postTravelValidation, submitPostTravelReport);
router.put('/:id/approve', authenticate, authorize('admin'), approveTravelGrant);
router.put('/:id/reject', authenticate, authorize('admin'), rejectTravelGrant);

export default router;
