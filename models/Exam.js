const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['Aptitude', 'Technical', 'Coding', 'HR', 'Mock Interview'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  duration: {
    type: Number,
    required: true,
    description: 'Duration in minutes'
  },
  totalMarks: {
    type: Number,
    required: true
  },
  passingMarks: {
    type: Number,
    required: true
  },
  questions: [{
    questionId: mongoose.Schema.Types.ObjectId,
    text: String,
    type: {
      type: String,
      enum: ['MCQ', 'Short Answer', 'Long Answer', 'Voice Based'],
      required: true
    },
    marks: Number,
    options: [String],
    correctAnswer: String,
    explanation: String,
    topic: String
  }],
  syllabus: [String],
  isLiveExam: {
    type: Boolean,
    default: false
  },
  enableVoiceProctoring: {
    type: Boolean,
    default: true
  },
  enableLiveAssistance: {
    type: Boolean,
    default: true
  },
  proctorSettings: {
    recordVideo: Boolean,
    monitorAudio: Boolean,
    detectCheating: Boolean,
    webcamRequired: Boolean
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
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

module.exports = mongoose.model('Exam', ExamSchema);
