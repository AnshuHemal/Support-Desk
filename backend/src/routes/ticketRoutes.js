import express from 'express';
import { body } from 'express-validator';
import {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  assignTicket,
  changeStatus,
  addReply,
  mergeTickets,
  addDependency,
  removeDependency,
  getTicketHistory,
} from '../controllers/ticketController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/',
  protect,
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('priority').isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid priority'),
    body('department').notEmpty().withMessage('Department is required'),
    validate,
  ],
  createTicket
);

router.get('/', protect, getTickets);
router.get('/:id', protect, getTicket);
router.put('/:id', protect, updateTicket);
router.get('/:id/history', protect, getTicketHistory);

router.patch('/:id/assign', protect, authorize('admin', 'agent'), assignTicket);
router.patch('/:id/status', protect, changeStatus);

router.post(
  '/:id/replies',
  protect,
  [
    body('message').trim().notEmpty().withMessage('Message is required'),
    validate,
  ],
  addReply
);

router.post(
  '/:id/merge',
  protect,
  authorize('admin', 'agent'),
  [
    body('targetTicketId').notEmpty().withMessage('Target ticket ID is required'),
    validate,
  ],
  mergeTickets
);

router.post(
  '/:id/dependencies',
  protect,
  authorize('admin', 'agent'),
  [
    body('dependentTicketId').notEmpty().withMessage('Dependent ticket ID is required'),
    body('type').isIn(['blocks', 'blocked_by', 'related']).withMessage('Invalid dependency type'),
    validate,
  ],
  addDependency
);

router.delete('/:id/dependencies', protect, authorize('admin', 'agent'), removeDependency);

export default router;
