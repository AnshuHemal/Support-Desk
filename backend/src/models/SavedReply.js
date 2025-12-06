import mongoose from 'mongoose';

const savedReplySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  shortcut: {
    type: String,
    trim: true,
    maxlength: 20
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'billing', 'greeting', 'closing', 'escalation', 'other'],
    default: 'general'
  },
  visibility: {
    type: String,
    enum: ['private', 'department', 'global'],
    default: 'private'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  lastUsedAt: {
    type: Date
  }
}, {
  timestamps: true
});
savedReplySchema.index({ createdBy: 1, isActive: 1 });
savedReplySchema.index({ department: 1, visibility: 1, isActive: 1 });
savedReplySchema.index({ category: 1, isActive: 1 });
savedReplySchema.index({ shortcut: 1 }, { unique: true, sparse: true });
savedReplySchema.methods.recordUsage = async function() {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

export default mongoose.model('SavedReply', savedReplySchema);
