import express from 'express';
import { body } from 'express-validator';
import {
  createStatus,
  getStatuses,
  getStatus,
  updateStatus,
  deleteStatus,
} from '../controllers/statusController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('color').matches(/^#[0-9A-F]{6}$/i).withMessage('Valid hex color is required'),
    validate,
  ],
  createStatus
);

router.get('/', protect, getStatuses);
router.get('/:id', protect, getStatus);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('title').trim().notEmpty().withMessage('Title is required'),
    body('color').matches(/^#[0-9A-F]{6}$/i).withMessage('Valid hex color is required'),
    validate,
  ],
  updateStatus
);

router.delete('/:id', protect, authorize('admin'), deleteStatus);

export default router;
