import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  mimetype: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reply',
  },
}, {
  timestamps: true,
});
attachmentSchema.index({ ticket: 1 });
attachmentSchema.index({ uploadedBy: 1 });
attachmentSchema.virtual('url').get(function() {
  return `/api/attachments/${this._id}/download`;
});
attachmentSchema.virtual('thumbnailUrl').get(function() {
  if (this.mimetype.startsWith('image/')) {
    return `/api/attachments/${this._id}/thumbnail`;
  }
  return null;
});
attachmentSchema.virtual('category').get(function() {
  if (this.mimetype.startsWith('image/')) return 'image';
  if (this.mimetype === 'application/pdf') return 'pdf';
  if (this.mimetype.includes('word') || this.mimetype.includes('document')) return 'document';
  if (this.mimetype.includes('sheet') || this.mimetype.includes('excel')) return 'spreadsheet';
  if (this.mimetype.includes('presentation') || this.mimetype.includes('powerpoint')) return 'presentation';
  if (this.mimetype.startsWith('text/')) return 'text';
  if (this.mimetype.includes('zip') || this.mimetype.includes('rar')) return 'archive';
  return 'other';
});
attachmentSchema.set('toJSON', { virtuals: true });
attachmentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Attachment', attachmentSchema);
