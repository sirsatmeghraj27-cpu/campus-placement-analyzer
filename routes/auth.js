const express = require('express');
const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new student
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, rollNumber, department, semester } = req.body;

    // Validate required fields
    if (!name || !email || !password || !rollNumber || !department || !semester) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if student already exists
    const existingStudent = await Student.findOne({ 
      $or: [{ email }, { rollNumber }] 
    });

    if (existingStudent) {
      return res.status(409).json({ error: 'Student already exists' });
    }

    // Create new student
    const student = new Student({
      name,
      email,
      password,
      rollNumber,
      department,
      semester
    });

    await student.save();

    // Generate JWT token
    const token = jwt.sign(
      { studentId: student._id, email: student.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.status(201).json({
      success: true,
      message: '✅ Student registered successfully',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        rollNumber: student.rollNumber
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Login student
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await student.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { studentId: student._id, email: student.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      success: true,
      message: '✅ Login successful',
      token,
      student: {
        id: student._id,
        name: student.name,
        email: student.email
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/auth/profile
 * Get student profile (protected)
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const student = await Student.findById(req.studentId);

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({
      success: true,
      student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/auth/update-profile
 * Update student profile
 */
router.put('/update-profile', authenticateToken, async (req, res) => {
  try {
    const { name, department, semester, voicePreferences } = req.body;

    const student = await Student.findByIdAndUpdate(
      req.studentId,
      {
        ...(name && { name }),
        ...(department && { department }),
        ...(semester && { semester }),
        ...(voicePreferences && { voicePreferences })
      },
      { new: true }
    );

    res.json({
      success: true,
      message: '✅ Profile updated successfully',
      student
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.studentId = decoded.studentId;
    next();
  });
}

module.exports = router;
