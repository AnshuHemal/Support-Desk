import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
  ticketNumber: {
    type: String,
    unique: true,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
  },
  status: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Status',
    required: true,
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  dependencies: [{
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
    },
    type: {
      type: String,
      enum: ['blocks', 'blocked_by', 'related'],
      default: 'blocks',
    },
  }],
  mergedInto: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
  },
  isMerged: {
    type: Boolean,
    default: false,
  },
  lastActivityAt: {
    type: Date,
    default: Date.now,
  },
  closedAt: Date,
  version: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});
ticketSchema.index({ status: 1, department: 1 });
ticketSchema.index({ assignedTo: 1 });
ticketSchema.index({ createdBy: 1 });
ticketSchema.index({ priority: 1 });
ticketSchema.index({ lastActivityAt: -1 });
ticketSchema.index({ createdAt: -1 });

ticketSchema.pre('save', function() {
  this.version += 1;
});

export default mongoose.model('Ticket', ticketSchema);
