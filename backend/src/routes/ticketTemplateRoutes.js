import express from 'express';
import * as ticketTemplateController from '../controllers/ticketTemplateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();
router.use(protect);
router.get('/', ticketTemplateController.getTicketTemplates);
router.get('/:id', ticketTemplateController.getTicketTemplate);
router.post('/', ticketTemplateController.createTicketTemplate);
router.put('/:id', ticketTemplateController.updateTicketTemplate);
router.delete('/:id', ticketTemplateController.deleteTicketTemplate);
router.post('/:id/usage', ticketTemplateController.recordUsage);
router.post('/:id/duplicate', ticketTemplateController.duplicateTicketTemplate);

export default router;
