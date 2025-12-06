import express from 'express';
import { body } from 'express-validator';
import {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ],
  createDepartment
);

router.get('/', protect, getDepartments);
router.get('/:id', protect, getDepartment);

router.put(
  '/:id',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    validate,
  ],
  updateDepartment
);

router.delete('/:id', protect, authorize('admin'), deleteDepartment);

export default router;
