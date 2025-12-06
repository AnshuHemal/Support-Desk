import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  action: {
    type: String,
    required: true,
    enum: [
      'created',
      'updated',
      'status_changed',
      'assigned',
      'replied',
      'merged',
      'closed',
      'reopened',
      'escalated',
      'dependency_added',
      'dependency_removed',
    ],
  },
  changes: {
    type: mongoose.Schema.Types.Mixed,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
  },
  ipAddress: String,
  userAgent: String,
}, {
  timestamps: true,
});

auditLogSchema.index({ ticket: 1, createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1 });

export default mongoose.model('AuditLog', auditLogSchema);
