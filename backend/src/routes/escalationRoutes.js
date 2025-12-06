import express from 'express';
import { body } from 'express-validator';
import {
  createEscalationRule,
  getEscalationRules,
  getEscalationRule,
  updateEscalationRule,
  deleteEscalationRule,
  toggleEscalationRule,
} from '../controllers/escalationController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('conditions').isObject().withMessage('Conditions must be an object'),
    body('actions').isArray({ min: 1 }).withMessage('At least one action is required'),
    validate,
  ],
  createEscalationRule
);

router.get('/', protect, authorize('admin', 'agent'), getEscalationRules);
router.get('/:id', protect, authorize('admin', 'agent'), getEscalationRule);

router.put('/:id', protect, authorize('admin'), updateEscalationRule);
router.delete('/:id', protect, authorize('admin'), deleteEscalationRule);
router.patch('/:id/toggle', protect, authorize('admin'), toggleEscalationRule);

export default router;
