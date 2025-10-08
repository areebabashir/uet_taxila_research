import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getThesisSupervisions,
  getThesisSupervisionById,
  createThesisSupervision,
  updateThesisSupervision,
  deleteThesisSupervision,
  updateThesisDefense,
  getThesisStats,
  approveThesisSupervision,
  rejectThesisSupervision
} from '../controllers/thesisController.js';
import {
  body,
  validationResult
} from 'express-validator';

const router = express.Router();

// Validation middleware for thesis supervision creation/update
const thesisValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('thesisType')
    .isIn(['MS', 'MSc', 'MPhil', 'PhD', 'Post Doc'])
    .withMessage('Invalid thesis type'),
  body('degree')
    .isIn(['MS', 'MSc', 'MPhil', 'PhD', 'Post Doc'])
    .withMessage('Invalid degree type'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('expectedCompletionDate')
    .isISO8601()
    .withMessage('Expected completion date must be a valid date'),
  body('student.name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Student name must be between 2 and 100 characters'),
  body('student.rollNumber')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Roll number must be between 3 and 20 characters'),
  body('student.email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid student email'),
  body('student.batch')
    .trim()
    .isLength({ min: 2, max: 10 })
    .withMessage('Batch must be between 2 and 10 characters'),
  body('student.degree')
    .isIn(['MS', 'MSc', 'MPhil', 'PhD', 'Post Doc'])
    .withMessage('Invalid degree type'),
  body('student.department')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('researchArea')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Research area must be between 2 and 100 characters'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
];

// Validation middleware for thesis defense
const defenseValidation = [
  body('date')
    .isISO8601()
    .withMessage('Defense date must be a valid date'),
  body('time')
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Time must be between 1 and 20 characters'),
  body('venue')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Venue must be between 2 and 100 characters'),
  body('result')
    .isIn(['Pass', 'Pass with Minor Revisions', 'Pass with Major Revisions', 'Fail', 'Pending'])
    .withMessage('Invalid defense result'),
  body('examiners')
    .optional()
    .isArray()
    .withMessage('Examiners must be an array'),
  body('comments')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Comments cannot exceed 1000 characters'),
  body('recommendations')
    .optional()
    .isArray()
    .withMessage('Recommendations must be an array')
];

// Apply routes with no authentication for public access
router.get('/', getThesisSupervisions);
router.get('/stats', getThesisStats);
router.get('/:id', getThesisSupervisionById);
router.post('/', authenticate, thesisValidation, createThesisSupervision);
router.put('/:id', authenticate, thesisValidation, updateThesisSupervision);
router.delete('/:id', authenticate, deleteThesisSupervision);
router.put('/:id/defense', authenticate, defenseValidation, updateThesisDefense);
router.put('/:id/approve', authenticate, authorize('admin'), approveThesisSupervision);
router.put('/:id/reject', authenticate, authorize('admin'), rejectThesisSupervision);

export default router;
