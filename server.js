const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const examRoutes = require('./routes/exam');
const studentRoutes = require('./routes/student');
const placementRoutes = require('./routes/placement');
const voiceRoutes = require('./routes/voice');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-placement', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/voice', voiceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: '✅ Server is running', timestamp: new Date() });
});

// Socket.IO Events for Real-time Exam Proctoring
io.on('connection', (socket) => {
  console.log('📱 New student connected:', socket.id);

  // Exam started
  socket.on('exam-started', (data) => {
    console.log('📝 Exam started by student:', data.studentId);
    socket.emit('exam-ready', { message: 'Exam started successfully' });
  });

  // Voice input during exam
  socket.on('voice-input', (data) => {
    console.log('🎤 Voice input received:', data.text);
    // Process voice and send suggestions
    socket.emit('suggestion', { suggestion: 'Great answer! Consider...' });
  });

  // Real-time suggestions
  socket.on('request-suggestion', (data) => {
    console.log('💡 Suggestion requested for:', data.topic);
    socket.emit('live-suggestion', { 
      topic: data.topic,
      suggestion: 'Based on your performance...'
    });
  });

  // Exam completed
  socket.on('exam-completed', (data) => {
    console.log('✅ Exam completed by student:', data.studentId);
    socket.emit('results-ready', { message: 'Results processing...' });
  });

  socket.on('disconnect', () => {
    console.log('👋 Student disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready for real-time communication`);
});

module.exports = { app, io };
