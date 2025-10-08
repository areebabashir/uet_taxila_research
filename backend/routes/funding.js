import express from 'express';
import { getFundingStats, getFundingByDepartment, getFundingByAgency, getFundingOpportunities, getFundingSources } from '../controllers/fundingController.js';

const router = express.Router();

// Get comprehensive funding statistics
router.get('/stats', getFundingStats);

// Get funding statistics by department
router.get('/department/:department', getFundingByDepartment);

// Get funding statistics by agency
router.get('/agency/:agency', getFundingByAgency);

// Get current funding opportunities
router.get('/opportunities', getFundingOpportunities);

// Get all funding sources
router.get('/sources', getFundingSources);

export default router;
