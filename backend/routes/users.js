import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  resetUserPassword,
  getUserStats
} from '../controllers/userController.js';
import {
  getUsersValidation,
  createUserValidation,
  updateUserValidation,
  resetPasswordValidation
} from '../middleware/validation.js';

const router = express.Router();

// Apply routes with validation, authentication, and authorization middleware
router.get('/', getUsersValidation, getUsers);
router.get('/stats', authenticate, authorize('admin'), getUserStats);
router.get('/:id', getUserById);
router.post('/', authenticate, authorize('admin'), createUserValidation, createUser);
router.put('/:id', authenticate, authorize('admin'), updateUserValidation, updateUser);
router.delete('/:id', authenticate, authorize('admin'), deleteUser);
router.put('/:id/reset-password', authenticate, authorize('admin'), resetPasswordValidation, resetUserPassword);

export default router;
