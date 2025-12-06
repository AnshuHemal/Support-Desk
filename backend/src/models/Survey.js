import mongoose from 'mongoose';

const surveySchema = new mongoose.Schema(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ticket',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },

    ratings: {
      overall: {
        type: Number,
        min: 1,
        max: 5,
        required: true,
      },
      responseTime: {
        type: Number,
        min: 1,
        max: 5,
      },
      professionalism: {
        type: Number,
        min: 1,
        max: 5,
      },
      knowledgeability: {
        type: Number,
        min: 1,
        max: 5,
      },
      problemResolution: {
        type: Number,
        min: 1,
        max: 5,
      },
    },

    feedback: {
      positive: {
        type: String,
        maxlength: 1000,
      },
      improvement: {
        type: String,
        maxlength: 1000,
      },
      general: {
        type: String,
        maxlength: 2000,
      },
    },

    status: {
      type: String,
      enum: ['pending', 'completed', 'expired'],
      default: 'pending',
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },

    token: {
      type: String,
      required: true,
    },

    npsScore: {
      type: Number,
      min: 0,
      max: 10,
    },
    npsCategory: {
      type: String,
      enum: ['detractor', 'passive', 'promoter'],
    },

    ipAddress: String,
    userAgent: String,
    responseTime: Number, // Time taken to complete survey in seconds
  },
  {
    timestamps: true,
  }
);

surveySchema.index({ ticket: 1 }, { unique: true });
surveySchema.index({ customer: 1 });
surveySchema.index({ agent: 1 });
surveySchema.index({ department: 1 });
surveySchema.index({ status: 1 });
surveySchema.index({ token: 1 }, { unique: true });
surveySchema.index({ createdAt: -1 });
surveySchema.index({ 'ratings.overall': 1 });

surveySchema.virtual('averageRating').get(function () {
  const ratings = this.ratings;
  const values = [
    ratings.overall,
    ratings.responseTime,
    ratings.professionalism,
    ratings.knowledgeability,
    ratings.problemResolution,
  ].filter((r) => r !== undefined && r !== null);

  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
});

surveySchema.methods.calculateNPS = function () {
  if (!this.npsScore) return null;

  if (this.npsScore >= 9) {
    this.npsCategory = 'promoter';
  } else if (this.npsScore >= 7) {
    this.npsCategory = 'passive';
  } else {
    this.npsCategory = 'detractor';
  }

  return this.npsCategory;
};

surveySchema.methods.isExpired = function () {
  return new Date() > this.expiresAt;
};

surveySchema.methods.complete = async function () {
  this.status = 'completed';
  this.completedAt = new Date();
  this.responseTime = Math.floor(
    (this.completedAt - this.sentAt) / 1000
  );
  await this.save();
};

export default mongoose.model('Survey', surveySchema);
