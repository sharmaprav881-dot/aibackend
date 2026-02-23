const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  expectedAnswer: {
    type: String,
    required: true,
  },
  userAnswer: {
    type: String,
    default: '',
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  feedback: {
    type: String,
    default: '',
  },
});

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    techStack: {
      type: String,
      required: true,
      enum: ['React', 'Node', 'MERN', 'DSA'],
    },
    level: {
      type: String,
      required: true,
      enum: ['Fresher', '2-3 Years', 'Senior'],
    },
    questions: [questionSchema],
    totalScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    status: {
      type: String,
      enum: ['created', 'in-progress', 'completed'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total score before saving
interviewSchema.pre('save', function (next) {
  if (this.questions && this.questions.length > 0) {
    const totalScore =
      this.questions.reduce((sum, q) => sum + (q.score || 0), 0) /
      this.questions.length;
    this.totalScore = Math.round(totalScore * 100) / 100;
  }
  next();
});

module.exports = mongoose.model('Interview', interviewSchema);
