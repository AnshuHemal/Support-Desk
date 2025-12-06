import mongoose from 'mongoose';

const replySchema = new mongoose.Schema({
  ticket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  isInternal: {
    type: Boolean,
    default: false,
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number,
  }],
}, {
  timestamps: true,
});

replySchema.index({ ticket: 1, createdAt: -1 });

export default mongoose.model('Reply', replySchema);
