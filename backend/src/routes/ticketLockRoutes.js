import express from 'express';
import * as ticketLockController from '../controllers/ticketLockController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/:ticketId/acquire', ticketLockController.acquireLock);
router.post('/:ticketId/release', ticketLockController.releaseLock);
router.post('/:ticketId/refresh', ticketLockController.refreshLock);
router.get('/:ticketId/check', ticketLockController.checkLock);

export default router;
