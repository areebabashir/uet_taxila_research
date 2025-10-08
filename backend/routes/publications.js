import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  reviewPublication,
  getPublicationStats,
  approvePublication,
  rejectPublication
} from '../controllers/publicationController.js';
import {
  body,
  validationResult
} from 'express-validator';

const router = express.Router();

// Validation middleware for publication creation/update
const publicationValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('publicationType')
    .isIn(['Journal Article', 'Conference Paper', 'Book Chapter', 'Book', 'Patent', 'Technical Report', 'Other'])
    .withMessage('Invalid publication type'),
  body('publicationDate')
    .isISO8601()
    .withMessage('Publication date must be a valid date'),
  body('authors')
    .isArray({ min: 1 })
    .withMessage('At least one author is required'),
  body('authors.*.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Author name must be between 2 and 100 characters'),
  body('authors.*.authorOrder')
    .isInt({ min: 1 })
    .withMessage('Author order must be a positive integer'),
  body('doi')
    .optional()
    .trim()
    .isLength({ min: 10, max: 100 })
    .withMessage('DOI must be between 10 and 100 characters'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
];

// Validation middleware for publication review
const reviewValidation = [
  body('status')
    .isIn(['Draft', 'Submitted', 'Under Review', 'Approved', 'Rejected', 'Published'])
    .withMessage('Invalid status'),
  body('reviewComments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comments cannot exceed 1000 characters')
];

// Apply routes with no authentication for public access
router.get('/', getPublications);
router.get('/stats', getPublicationStats);
router.get('/:id', getPublicationById);
router.post('/', authenticate, publicationValidation, createPublication);
router.put('/:id', authenticate, publicationValidation, updatePublication);
router.delete('/:id', authenticate, deletePublication);
router.put('/:id/review', authenticate, authorize('admin'), reviewValidation, reviewPublication);
router.put('/:id/approve', authenticate, authorize('admin'), approvePublication);
router.put('/:id/reject', authenticate, authorize('admin'), rejectPublication);

export default router;
