const express = require('express');
const router = express.Router();
const Exam = require('../models/Exam');

/**
 * GET /api/exam/list
 * Get all available exams
 */
router.get('/list', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const exams = await Exam.find(filter)
      .select('-questions')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      total: exams.length,
      exams
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/exam/:id
 * Get exam details
 */
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    res.json({
      success: true,
      exam
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/exam/start
 * Start taking an exam
 */
router.post('/start', async (req, res) => {
  try {
    const { examId, studentId } = req.body;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    const examSession = {
      examId,
      studentId,
      startTime: new Date(),
      endTime: new Date(Date.now() + exam.duration * 60000),
      status: 'In Progress',
      answers: [],
      score: 0
    };

    res.json({
      success: true,
      message: '✅ Exam started successfully',
      examSession,
      exam: {
        title: exam.title,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        questions: exam.questions,
        enableVoiceProctoring: exam.enableVoiceProctoring,
        enableLiveAssistance: exam.enableLiveAssistance
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/exam/submit-answer
 * Submit an answer during exam
 */
router.post('/submit-answer', async (req, res) => {
  try {
    const { examId, questionId, answer, answerType } = req.body;

    if (!examId || !questionId || !answer) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    res.json({
      success: true,
      message: '✅ Answer submitted',
      questionId,
      answerType
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/exam/submit
 * Submit completed exam
 */
router.post('/submit', async (req, res) => {
  try {
    const { examId, studentId, answers, timeTaken } = req.body;

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ error: 'Exam not found' });
    }

    // Calculate score
    let score = 0;
    let correctAnswers = 0;

    exam.questions.forEach((question) => {
      const studentAnswer = answers.find(a => a.questionId === question.questionId);
      
      if (studentAnswer && studentAnswer.answer === question.correctAnswer) {
        score += question.marks;
        correctAnswers++;
      }
    });

    const percentage = (score / exam.totalMarks) * 100;
    const isPassed = percentage >= (exam.passingMarks / exam.totalMarks) * 100;

    res.json({
      success: true,
      message: '✅ Exam submitted successfully',
      result: {
        score,
        totalMarks: exam.totalMarks,
        percentage: percentage.toFixed(2),
        correctAnswers,
        totalQuestions: exam.questions.length,
        timeTaken,
        isPassed,
        category: exam.category
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
