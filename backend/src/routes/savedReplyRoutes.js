import express from 'express';
import * as savedReplyController from '../controllers/savedReplyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', savedReplyController.getSavedReplies);
router.get('/shortcut/:shortcut', savedReplyController.getSavedReplyByShortcut);
router.get('/:id', savedReplyController.getSavedReply);
router.post('/', savedReplyController.createSavedReply);
router.put('/:id', savedReplyController.updateSavedReply);
router.delete('/:id', savedReplyController.deleteSavedReply);
router.post('/:id/usage', savedReplyController.recordUsage);

export default router;
