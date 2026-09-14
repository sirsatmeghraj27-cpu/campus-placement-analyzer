const express = require('express');
const router = express.Router();
const Student = require('../models/Student');

/**
 * GET /api/placement/statistics
 * Get overall placement statistics
 */
router.get('/statistics', async (req, res) => {
  try {
    const students = await Student.find();

    const stats = {
      totalStudents: students.length,
      placed: students.filter(s => s.placementStatus === 'Placed').length,
      notApplied: students.filter(s => s.placementStatus === 'Not Applied').length,
      applied: students.filter(s => s.placementStatus === 'Applied').length,
      shortlisted: students.filter(s => s.placementStatus === 'Shortlisted').length,
      rejected: students.filter(s => s.placementStatus === 'Rejected').length
    };

    const placementRate = ((stats.placed / stats.totalStudents) * 100).toFixed(2);

    res.json({
      success: true,
      statistics: stats,
      placementRate: `${placementRate}%`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/placement/top-performers
 * Get top performing students
 */
router.get('/top-performers', async (req, res) => {
  try {
    const students = await Student.find()
      .sort({ 'performanceMetrics.averageScore': -1 })
      .limit(10)
      .select('name rollNumber cgpa performanceMetrics placementStatus placementDetails');

    res.json({
      success: true,
      topPerformers: students
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/placement/company-offers
 * Get placement offers by company
 */
router.get('/company-offers', async (req, res) => {
  try {
    const students = await Student.find({
      placementStatus: 'Placed'
    });

    const companyOffers = {};

    students.forEach(student => {
      if (student.placementDetails && student.placementDetails.companyName) {
        const company = student.placementDetails.companyName;
        if (!companyOffers[company]) {
          companyOffers[company] = {
            count: 0,
            offers: []
          };
        }
        companyOffers[company].count++;
        companyOffers[company].offers.push({
          studentName: student.name,
          position: student.placementDetails.position,
          salary: student.placementDetails.salary
        });
      }
    });

    res.json({
      success: true,
      companyOffers
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/placement/register-drive
 * Register student for placement drive
 */
router.post('/register-drive', async (req, res) => {
  try {
    const { studentId, driveId, companyName } = req.body;

    const student = await Student.findById(studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Update placement status
    student.placementStatus = 'Applied';
    await student.save();

    res.json({
      success: true,
      message: `✅ Registered for ${companyName} drive`,
      student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/placement/interview-prep
 * Get interview preparation resources
 */
router.get('/interview-prep', async (req, res) => {
  try {
    const resources = {
      success: true,
      categories: [
        {
          category: 'Aptitude',
          topics: ['Quantitative', 'Logical Reasoning', 'Verbal Ability']
        },
        {
          category: 'Technical',
          topics: ['Data Structures', 'Algorithms', 'System Design']
        },
        {
          category: 'HR',
          topics: ['Tell Me About Yourself', 'Strengths & Weaknesses', 'Career Goals']
        }
      ],
      mockInterviews: [
        {
          id: 1,
          title: 'Mock Interview - Senior Engineer',
          difficulty: 'Hard',
          duration: 45
        },
        {
          id: 2,
          title: 'Mock Interview - Junior Developer',
          difficulty: 'Medium',
          duration: 30
        }
      ]
    };

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
