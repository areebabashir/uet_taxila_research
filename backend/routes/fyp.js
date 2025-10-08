import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getFYPProjects,
  getFYPProjectById,
  createFYPProject,
  updateFYPProject,
  deleteFYPProject,
  gradeFYPProject,
  getFYPStats,
  approveFYPProject,
  rejectFYPProject
} from '../controllers/fypController.js';
import {
  body,
  validationResult
} from 'express-validator';

const router = express.Router();

// Validation middleware for FYP project creation/update
const fypValidation = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('projectType')
    .isIn(['FYP', 'Capstone', 'Thesis', 'Research Project', 'Design Project'])
    .withMessage('Invalid project type'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('endDate')
    .isISO8601()
    .withMessage('End date must be a valid date'),
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
    .isIn(['BS', 'BE', 'BSc', 'MS', 'MSc', 'ME', 'MPhil', 'PhD'])
    .withMessage('Invalid degree type'),
  body('student.department')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('keywords')
    .optional()
    .isArray()
    .withMessage('Keywords must be an array')
];

// Validation middleware for FYP grading
const gradingValidation = [
  body('supervisorMarks')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Supervisor marks must be between 0 and 100'),
  body('externalMarks')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('External marks must be between 0 and 100'),
  body('defenseMarks')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Defense marks must be between 0 and 100'),
  body('grade')
    .optional()
    .isIn(['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D', 'F'])
    .withMessage('Invalid grade'),
  body('evaluators')
    .optional()
    .isArray()
    .withMessage('Evaluators must be an array')
];

// Apply routes with no authentication for public access
router.get('/', getFYPProjects);
router.get('/stats', getFYPStats);
router.get('/:id', getFYPProjectById);
router.post('/', authenticate, fypValidation, createFYPProject);
router.put('/:id', authenticate, fypValidation, updateFYPProject);
router.delete('/:id', authenticate, deleteFYPProject);
router.put('/:id/grade', authenticate, gradingValidation, gradeFYPProject);
router.put('/:id/approve', authenticate, authorize('admin'), approveFYPProject);
router.put('/:id/reject', authenticate, authorize('admin'), rejectFYPProject);

export default router;
