import TicketLock from '../models/TicketLock.js';
import { getIO } from '../config/socket.js';

const LOCK_DURATION = 5 * 60 * 1000;

export const acquireLock = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const existingLock = await TicketLock.findOne({
      ticket: ticketId,
      isActive: true,
    }).populate('lockedBy', 'name email');

    if (existingLock) {
      if (existingLock.isExpired()) {
        await existingLock.release();
      } else if (existingLock.lockedBy._id.toString() !== userId) {
        return res.status(409).json({
          locked: true,
          lockedBy: {
            name: existingLock.lockedBy.name,
            email: existingLock.lockedBy.email,
          },
          lockedAt: existingLock.lockedAt,
          expiresAt: existingLock.expiresAt,
        });
      } else {
        await existingLock.updateActivity();
        return res.json({
          locked: false,
          lock: existingLock,
        });
      }
    }

    const lock = new TicketLock({
      ticket: ticketId,
      lockedBy: userId,
      expiresAt: new Date(Date.now() + LOCK_DURATION),
    });

    await lock.save();
    await lock.populate('lockedBy', 'name email');

    const io = getIO();
    io.to(`ticket-${ticketId}`).emit('ticket-locked', {
      ticketId,
      lockedBy: {
        id: lock.lockedBy._id,
        name: lock.lockedBy.name,
        email: lock.lockedBy.email,
      },
      lockedAt: lock.lockedAt,
    });

    res.json({
      locked: false,
      lock,
    });
  } catch (error) {
    console.error('Error acquiring lock:', error);
    res.status(500).json({ message: 'Error acquiring lock' });
  }
};

export const releaseLock = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const lock = await TicketLock.findOne({
      ticket: ticketId,
      lockedBy: userId,
      isActive: true,
    });

    if (lock) {
      await lock.release();

      const io = getIO();
      io.to(`ticket-${ticketId}`).emit('ticket-unlocked', {
        ticketId,
        unlockedBy: userId,
      });
    }

    res.json({ message: 'Lock released' });
  } catch (error) {
    console.error('Error releasing lock:', error);
    res.status(500).json({ message: 'Error releasing lock' });
  }
};

export const refreshLock = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    const lock = await TicketLock.findOne({
      ticket: ticketId,
      lockedBy: userId,
      isActive: true,
    });

    if (!lock) {
      return res.status(404).json({ message: 'Lock not found' });
    }

    if (lock.isExpired()) {
      await lock.release();
      return res.status(410).json({ message: 'Lock expired' });
    }

    await lock.updateActivity();

    res.json({ lock });
  } catch (error) {
    console.error('Error refreshing lock:', error);
    res.status(500).json({ message: 'Error refreshing lock' });
  }
};

export const checkLock = async (req, res) => {
  try {
    const { ticketId } = req.params;

    const lock = await TicketLock.findOne({
      ticket: ticketId,
      isActive: true,
    }).populate('lockedBy', 'name email');

    if (!lock) {
      return res.json({ locked: false });
    }

    if (lock.isExpired()) {
      await lock.release();
      return res.json({ locked: false });
    }

    res.json({
      locked: true,
      lockedBy: {
        id: lock.lockedBy._id,
        name: lock.lockedBy.name,
        email: lock.lockedBy.email,
      },
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
    });
  } catch (error) {
    console.error('Error checking lock:', error);
    res.status(500).json({ message: 'Error checking lock' });
  }
};

export const cleanupExpiredLocks = async () => {
  try {
    const expiredLocks = await TicketLock.find({
      isActive: true,
      expiresAt: { $lt: new Date() },
    });

    for (const lock of expiredLocks) {
      await lock.release();
      
      const io = getIO();
      io.to(`ticket-${lock.ticket}`).emit('ticket-unlocked', {
        ticketId: lock.ticket,
        reason: 'expired',
      });
    }

    if (expiredLocks.length > 0) {
      console.log(`Cleaned up ${expiredLocks.length} expired locks`);
    }
  } catch (error) {
    console.error('Error cleaning up expired locks:', error);
  }
};
