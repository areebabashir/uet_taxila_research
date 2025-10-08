import express from 'express';
import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  respondToContact,
  deleteContact,
  getContactStats,
  bulkUpdateContacts,
  markAsResolved,
  closeContact
} from '../controllers/contactController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createContact); // Create new contact (public)

// Protected routes (admin only)
router.get('/', authenticate, authorize('admin'), getContacts); // Get all contacts
router.get('/stats', authenticate, authorize('admin'), getContactStats); // Get contact statistics
router.get('/:id', authenticate, authorize('admin'), getContactById); // Get contact by ID
router.put('/:id', authenticate, authorize('admin'), updateContact); // Update contact
router.put('/:id/respond', authenticate, authorize('admin'), respondToContact); // Respond to contact
router.put('/:id/resolve', authenticate, authorize('admin'), markAsResolved); // Mark as resolved
router.put('/:id/close', authenticate, authorize('admin'), closeContact); // Close contact
router.delete('/:id', authenticate, authorize('admin'), deleteContact); // Delete contact
router.put('/bulk/update', authenticate, authorize('admin'), bulkUpdateContacts); // Bulk update contacts

export default router;
