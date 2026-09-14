const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const StudentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  department: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  cgpa: {
    type: Number,
    default: 0
  },
  examsAttended: [{
    examId: mongoose.Schema.Types.ObjectId,
    score: Number,
    totalMarks: Number,
    percentage: Number,
    date: { type: Date, default: Date.now },
    feedback: String
  }],
  placementStatus: {
    type: String,
    enum: ['Not Applied', 'Applied', 'Shortlisted', 'Placed', 'Rejected'],
    default: 'Not Applied'
  },
  placementDetails: {
    companyName: String,
    position: String,
    salary: Number,
    joiningDate: Date
  },
  performanceMetrics: {
    averageScore: Number,
    strongAreas: [String],
    weakAreas: [String],
    improvementRate: Number
  },
  voicePreferences: {
    enableVoiceAssistant: { type: Boolean, default: true },
    voiceLanguage: { type: String, default: 'en-US' },
    speakingRate: { type: Number, default: 1.0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
StudentSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
StudentSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Calculate performance metrics
StudentSchema.methods.updatePerformanceMetrics = function() {
  if (this.examsAttended.length === 0) return;

  const scores = this.examsAttended.map(e => e.percentage);
  this.performanceMetrics.averageScore = 
    scores.reduce((a, b) => a + b, 0) / scores.length;

  // Calculate improvement rate
  if (scores.length > 1) {
    this.performanceMetrics.improvementRate = 
      ((scores[scores.length - 1] - scores[0]) / scores[0]) * 100;
  }
};

module.exports = mongoose.model('Student', StudentSchema);
