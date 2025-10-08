import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  reviewProject,
  getProjectStats,
  approveProject,
  rejectProject
} from '../controllers/projectController.js';
import {
  body,
  validationResult
} from 'express-validator';

const router = express.Router();

// Validation middleware for project creation/update
const projectValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('projectType')
    .isIn(['Research', 'Development', 'Consultancy', 'Training', 'Infrastructure', 'Other'])
    .withMessage('Invalid project type'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
  body('totalBudget')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Total budget must be a positive number'),
  body('fundingAgency.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Funding agency name must be between 2 and 100 characters'),
  body('duration')
    .isInt({ min: 1 })
    .withMessage('Duration must be a positive integer (in months)'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
];

// Validation middleware for project review
const reviewValidation = [
  body('status')
    .isIn(['Proposed', 'Submitted', 'Under Review', 'Approved', 'Active', 'Completed', 'Terminated', 'Suspended'])
    .withMessage('Invalid status'),
  body('reviewComments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Review comments cannot exceed 1000 characters')
];

// Apply routes with no authentication for public access
router.get('/', getProjects);
router.get('/stats', getProjectStats);
router.get('/:id', getProjectById);
router.post('/', authenticate, projectValidation, createProject);
router.put('/:id', authenticate, projectValidation, updateProject);
router.delete('/:id', authenticate, deleteProject);
router.put('/:id/review', authenticate, authorize('admin'), reviewValidation, reviewProject);
router.put('/:id/approve', authenticate, authorize('admin'), approveProject);
router.put('/:id/reject', authenticate, authorize('admin'), rejectProject);

export default router;
