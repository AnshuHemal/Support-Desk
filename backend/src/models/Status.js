import mongoose from 'mongoose';

const statusSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  color: {
    type: String,
    required: true,
    default: '#6B7280',
    match: /^#[0-9A-F]{6}$/i,
  },
  includeInActive: {
    type: Boolean,
    default: true,
  },
  autoClose: {
    type: Boolean,
    default: false,
  },
  autoCloseAfterDays: {
    type: Number,
    default: 7,
  },
  order: {
    type: Number,
    default: 0,
  },
  isSystem: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});
statusSchema.index({ order: 1 });

export default mongoose.model('Status', statusSchema);
