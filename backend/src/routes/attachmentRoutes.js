import express from 'express';
import {
  uploadAttachments,
  getTicketAttachments,
  downloadAttachment,
  viewAttachment,
  deleteAttachment,
  getThumbnail,
} from '../controllers/attachmentController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../config/upload.js';

const router = express.Router();
router.post('/upload', protect, upload.array('files', 5), uploadAttachments);
router.get('/ticket/:ticketId', protect, getTicketAttachments);
router.get('/:id/download', protect, downloadAttachment);
router.get('/:id/view', protect, viewAttachment);
router.get('/:id/thumbnail', protect, getThumbnail);
router.delete('/:id', protect, deleteAttachment);

export default router;
