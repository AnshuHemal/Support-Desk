import express from 'express';
import {
  getDashboardAnalytics,
  getTicketTrends,
  getDepartmentStats,
  getAgentStats,
  exportAnalytics,
  getPredictiveAnalytics,
  generatePDF,
  scheduleEmailReport,
  cancelEmailReport,
  getScheduledEmailReports,
  getAdvancedMLPredictions,
  naturalLanguageQuery,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, getDashboardAnalytics);
router.get('/trends', protect, getTicketTrends);
router.get('/departments', protect, getDepartmentStats);
router.get('/agents', protect, getAgentStats);
router.get('/export', protect, exportAnalytics);
router.get('/predictions', protect, getPredictiveAnalytics);
router.get('/pdf', protect, generatePDF);
router.get('/ml-predictions', protect, getAdvancedMLPredictions);
router.post('/schedule-report', protect, scheduleEmailReport);
router.post('/cancel-report', protect, cancelEmailReport);
router.get('/scheduled-reports', protect, getScheduledEmailReports);
router.post('/nl-query', protect, naturalLanguageQuery);

export default router;
