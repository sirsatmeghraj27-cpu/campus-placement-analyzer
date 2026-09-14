const express = require('express');
const router = express.Router();
const voiceAssistant = require('../services/voiceAssistant');
const multer = require('multer');

// Setup file upload for audio files
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * POST /api/voice/speech-to-text
 * Convert student's spoken answer to text
 */
router.post('/speech-to-text', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    const result = await voiceAssistant.speechToText(req.file.buffer);
    
    if (result.success) {
      res.json({
        success: true,
        text: result.text,
        confidence: result.confidence
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/voice/analyze-answer
 * Analyze student's answer and provide suggestions
 */
router.post('/analyze-answer', async (req, res) => {
  try {
    const { studentAnswer, questionContext, difficulty } = req.body;

    if (!studentAnswer || !questionContext) {
      return res.status(400).json({ 
        error: 'Missing studentAnswer or questionContext' 
      });
    }

    const result = await voiceAssistant.analyzeAnswer(
      studentAnswer,
      questionContext,
      difficulty || 'Medium'
    );

    if (result.success) {
      res.json({
        success: true,
        suggestion: result.suggestion
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/voice/live-suggestion
 * Get real-time suggestions during exam
 */
router.post('/live-suggestion', async (req, res) => {
  try {
    const { studentId, examData, performance } = req.body;

    if (!studentId || !examData || !performance) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const result = await voiceAssistant.getLiveSuggestions(
      studentId,
      examData,
      performance
    );

    if (result.success) {
      res.json({
        success: true,
        suggestions: result.suggestions
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/voice/text-to-speech
 * Convert text feedback to audio
 */
router.post('/text-to-speech', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'No text provided' });
    }

    const result = await voiceAssistant.textToSpeech(text);

    if (result.success) {
      res.json({
        success: true,
        audio: result.audioContent,
        format: 'mp3'
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/voice/exam-feedback
 * Generate comprehensive feedback for completed exam
 */
router.post('/exam-feedback', async (req, res) => {
  try {
    const { examResult } = req.body;

    if (!examResult) {
      return res.status(400).json({ error: 'No exam result provided' });
    }

    const result = await voiceAssistant.generateExamFeedback(examResult);

    if (result.success) {
      res.json({
        success: true,
        feedback: result.feedback
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
