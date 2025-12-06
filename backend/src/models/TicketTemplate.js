import mongoose from 'mongoose';

const ticketTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: [
        'technical',
        'billing',
        'account',
        'feature_request',
        'bug_report',
        'general',
        'other',
      ],
      default: 'general',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    visibility: {
      type: String,
      enum: ['private', 'department', 'global', 'public'],
      default: 'private',
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },
    icon: {
      type: String,
      default: 'FileText',
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
  },
  {
    timestamps: true,
  }
);
ticketTemplateSchema.index({ createdBy: 1, isActive: 1 });
ticketTemplateSchema.index({ department: 1, visibility: 1, isActive: 1 });
ticketTemplateSchema.index({ category: 1, isActive: 1 });
ticketTemplateSchema.index({ isPublic: 1, isActive: 1 });
ticketTemplateSchema.methods.recordUsage = async function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

export default mongoose.model('TicketTemplate', ticketTemplateSchema);
