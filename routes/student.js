const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

/**
 * GET /api/student/dashboard/:studentId
 * Get student dashboard with placement analytics
 */
router.get('/dashboard/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const dashboardData = {
      success: true,
      student: {
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        cgpa: student.cgpa
      },
      exams: {
        total: student.examsAttended.length,
        data: student.examsAttended
      },
      performance: student.performanceMetrics,
      placement: {
        status: student.placementStatus,
        details: student.placementDetails
      }
    };

    res.json(dashboardData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/student/exam-history/:studentId
 * Get student's exam history
 */
router.get('/exam-history/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId)
      .select('examsAttended');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      total: student.examsAttended.length,
      exams: student.examsAttended.sort((a, b) => b.date - a.date)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/student/update-exam-result
 * Update exam result for a student
 */
router.post('/update-exam-result', async (req, res) => {
  try {
    const { studentId, examId, score, totalMarks, feedback } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const percentage = (score / totalMarks) * 100;

    student.examsAttended.push({
      examId,
      score,
      totalMarks,
      percentage,
      date: new Date(),
      feedback
    });

    // Update performance metrics
    student.updatePerformanceMetrics();

    await student.save();

    res.json({
      success: true,
      message: '✅ Exam result saved',
      student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/student/update-placement-status/:studentId
 * Update student's placement status
 */
router.put('/update-placement-status/:studentId', async (req, res) => {
  try {
    const { status, placementDetails } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.params.studentId,
      {
        placementStatus: status,
        ...(placementDetails && { placementDetails })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '✅ Placement status updated',
      student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/student/analytics/:studentId
 * Get detailed analytics for student
 */
router.get('/analytics/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const analytics = {
      success: true,
      studentName: student.name,
      overallPerformance: student.performanceMetrics.averageScore || 0,
      improvementRate: student.performanceMetrics.improvementRate || 0,
      strongAreas: student.performanceMetrics.strongAreas || [],
      weakAreas: student.performanceMetrics.weakAreas || [],
      examsCompleted: student.examsAttended.length,
      placementStatus: student.placementStatus,
      recommendations: generateRecommendations(student)
    };

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Generate AI-powered recommendations
 */
function generateRecommendations(student) {
  const recommendations = [];

  if (student.performanceMetrics.averageScore < 50) {
    recommendations.push('Focus on foundational concepts - attend more practice sessions');
  }

  if (student.performanceMetrics.weakAreas.length > 0) {
    recommendations.push(
      `Improve weak areas: ${student.performanceMetrics.weakAreas.join(', ')}`
    );
  }

  if (student.placementStatus === 'Not Applied') {
    recommendations.push('Register for upcoming placement drives');
  }

  if (student.cgpa < 6) {
    recommendations.push('Improve CGPA through regular practice and study');
  }

  return recommendations;
}

module.exports = router;
