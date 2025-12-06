import mongoose from 'mongoose';

const escalationRuleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true,
  },
  priority: {
    type: Number,
    default: 0,
  },
  conditions: {
    logicOperator: {
      type: String,
      enum: ['AND', 'OR'],
      default: 'AND',
    },
    rules: [{
      field: {
        type: String,
        enum: ['department', 'status', 'priority', 'timeElapsed', 'assignedTo'],
        required: true,
      },
      operator: {
        type: String,
        enum: ['equals', 'notEquals', 'in', 'notIn', 'greaterThan', 'lessThan'],
        required: true,
      },
      value: mongoose.Schema.Types.Mixed,
    }],
  },
  actions: [{
    type: {
      type: String,
      enum: ['assignDepartment', 'changeStatus', 'updatePriority', 'assignUser', 'addReply', 'sendNotification'],
      required: true,
    },
    value: mongoose.Schema.Types.Mixed,
  }],
  lastExecuted: Date,
  executionCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

escalationRuleSchema.index({ isActive: 1, priority: -1 });

export default mongoose.model('EscalationRule', escalationRuleSchema);
