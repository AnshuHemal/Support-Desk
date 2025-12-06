import mongoose from 'mongoose';

const ticketLockSchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
      unique: true,
    },
    lockedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lockedAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ticketLockSchema.index({ ticket: 1, isActive: 1 });
ticketLockSchema.index({ lockedBy: 1 });
ticketLockSchema.index({ expiresAt: 1 });

ticketLockSchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

ticketLockSchema.methods.updateActivity = async function () {
  this.lastActivity = new Date();
  this.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  await this.save();
};

ticketLockSchema.methods.release = async function () {
  this.isActive = false;
  await this.save();
};

export default mongoose.model('TicketLock', ticketLockSchema);
