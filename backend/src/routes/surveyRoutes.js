import express from 'express';
import * as surveyController from '../controllers/surveyController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();
router.get('/public/:token', surveyController.getSurveyByToken);
router.post('/public/:token/submit', surveyController.submitSurvey);
router.use(protect);
router.post('/', authorize('admin', 'agent'), surveyController.createSurvey);
router.get('/', surveyController.getSurveys);
router.get('/analytics', surveyController.getSurveyAnalytics);
router.get('/:id', surveyController.getSurvey);
router.delete('/:id', authorize('admin'), surveyController.deleteSurvey);

export default router;
