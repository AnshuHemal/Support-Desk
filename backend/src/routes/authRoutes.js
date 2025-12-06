import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, getMe, getUsers } from '../controllers/authController.js';
import { getGoogleAuthUrl, googleAuthCallback } from '../controllers/googleAuthController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
      .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
      .matches(/[0-9]/).withMessage('Password must contain at least one number')
      .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password must contain at least one special character'),
    validate,
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  login
);

router.post('/logout', logout);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);
router.get('/google', getGoogleAuthUrl);
router.get('/google/callback', googleAuthCallback);

export default router;
