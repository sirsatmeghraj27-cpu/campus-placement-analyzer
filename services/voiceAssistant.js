const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Voice Assistant Service
 * Handles:
 * - Speech to Text conversion
 * - Processing student answers
 * - Real-time suggestions using AI
 * - Text to Speech for feedback
 */

class VoiceAssistant {
  constructor() {
    this.openaiKey = process.env.OPENAI_API_KEY;
    this.googleSpeechKey = process.env.GOOGLE_SPEECH_API_KEY;
  }

  /**
   * Convert speech to text using Google Speech API
   */
  async speechToText(audioBuffer) {
    try {
      const response = await axios.post(
        'https://speech.googleapis.com/v1/speech:recognize',
        {
          config: {
            encoding: 'LINEAR16',
            languageCode: 'en-US',
            sampleRateHertz: 16000
          },
          audio: {
            content: audioBuffer.toString('base64')
          }
        },
        {
          params: { key: this.googleSpeechKey }
        }
      );

      const transcript = response.data.results?.[0]?.alternatives?.[0]?.transcript;
      return { success: true, text: transcript || '' };
    } catch (error) {
      console.error('Speech to Text Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Analyze student answer and generate suggestions
   */
  async analyzeAnswer(studentAnswer, questionContext, difficulty) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: `You are an expert academic mentor for placement preparation. 
              Analyze the student's answer and provide constructive feedback.
              Difficulty Level: ${difficulty}`
            },
            {
              role: 'user',
              content: `Question: ${questionContext}\n\nStudent's Answer: ${studentAnswer}\n\n
              Please provide:
              1. Assessment of correctness
              2. Strengths in the answer
              3. Areas for improvement
              4. Tips for better placement interview performance`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const suggestion = response.data.choices?.[0]?.message?.content;
      return { success: true, suggestion };
    } catch (error) {
      console.error('OpenAI Analysis Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate real-time suggestions during live exam
   */
  async getLiveSuggestions(studentId, examData, performance) {
    try {
      const prompt = `Based on this student's exam performance, provide immediate suggestions:
      - Questions Answered: ${examData.questionsAnswered}
      - Current Score: ${performance.score}%
      - Time Remaining: ${performance.timeRemaining}
      - Weak Areas: ${performance.weakAreas.join(', ')}
      
      Provide 2-3 actionable suggestions to improve their performance in this exam.`;

      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a placement exam coach. Give quick, actionable suggestions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 150,
          temperature: 0.8
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        suggestions: response.data.choices?.[0]?.message?.content
      };
    } catch (error) {
      console.error('Live Suggestion Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Text to Speech - Read suggestions aloud
   */
  async textToSpeech(text) {
    try {
      const response = await axios.post(
        'https://texttospeech.googleapis.com/v1/text:synthesize',
        {
          input: { text },
          voice: {
            languageCode: 'en-US',
            name: 'en-US-Neural2-C'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0.0,
            speakingRate: 1.0
          }
        },
        {
          params: { key: this.googleSpeechKey }
        }
      );

      return {
        success: true,
        audioContent: response.data.audioContent
      };
    } catch (error) {
      console.error('Text to Speech Error:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process complete exam feedback
   */
  async generateExamFeedback(examResult) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'You are a placement preparation expert. Provide detailed, encouraging feedback.'
            },
            {
              role: 'user',
              content: `Exam Results:
              Score: ${examResult.score}/${examResult.totalMarks}
              Topics Covered: ${examResult.topicsCovered.join(', ')}
              Time Taken: ${examResult.timeTaken} minutes
              
              Provide personalized feedback and improvement areas for placement interview preparation.`
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        feedback: response.data.choices?.[0]?.message?.content
      };
    } catch (error) {
      console.error('Feedback Generation Error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new VoiceAssistant();
