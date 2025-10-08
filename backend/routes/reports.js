import express from 'express';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import {
  getComprehensiveStats,
  generateReport,
  exportData
} from '../controllers/reportController.js';

const router = express.Router();

// Get comprehensive statistics for all modules (public access)
router.get('/stats', getComprehensiveStats);

// Other routes require authentication
router.use(authenticate);

// Generate detailed report
router.post('/generate', generateReport);

// Export data in different formats
router.post('/export', exportData);

export default router;
