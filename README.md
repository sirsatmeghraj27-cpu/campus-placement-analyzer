# Campus Placement Analyzer 🎓

An intelligent campus placement analysis platform with **voice-enabled exam proctoring**, **real-time AI-powered suggestions**, and **live student assistance**. This system helps students prepare for placements through interactive exams, voice-based learning, and comprehensive analytics.

## 🌟 Key Features

### 1. **Voice-Enabled Exam Proctoring** 🎤
- Real-time speech-to-text conversion
- Live voice monitoring during exams
- Voice-based answer submission
- Anti-cheating detection

### 2. **Live Exam Assistance** 💡
- Real-time suggestions during exams
- AI-powered feedback on answers
- Performance tracking
- Weak area identification

### 3. **AI-Powered Voice Assistant** 🤖
- Analyzes student answers
- Provides instant feedback
- Generates personalized suggestions
- Text-to-speech for accessible learning

### 4. **Placement Analytics** 📊
- Student performance tracking
- Placement statistics dashboard
- Company-wise offer analysis
- Individual student analytics

### 5. **Exam Management** 📝
- Multiple exam categories (Aptitude, Technical, Coding, HR)
- Difficulty levels
- Customizable duration and marks
- Automatic result calculation

### 6. **Interview Preparation** 🎯
- Mock interviews
- Interview resources by category
- Tips and guidelines
- Performance metrics

## 🏗️ Project Structure

```
campus-placement-analyzer/
├── server.js                 # Main Express server with Socket.IO
├── package.json             # Dependencies
├── .env.example             # Environment configuration
├── models/
│   ├── Student.js           # Student schema with placement tracking
│   └── Exam.js              # Exam schema with voice proctoring
├── routes/
│   ├── auth.js              # Authentication (register, login)
│   ├── exam.js              # Exam management
│   ├── student.js           # Student dashboard & analytics
│   ├── placement.js         # Placement statistics
│   └── voice.js             # Voice assistant API
└── services/
    └── voiceAssistant.js    # AI-powered voice processing
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- OpenAI API Key
- Google Cloud APIs (Speech-to-Text & Text-to-Speech)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/sirsatmeghraj27-cpu/campus-placement-analyzer.git
   cd campus-placement-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start MongoDB:**
   ```bash
   mongod
   ```

5. **Run the server:**
   ```bash
   npm start
   ```

   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Student login
- `GET /api/auth/profile` - Get student profile
- `PUT /api/auth/update-profile` - Update profile

### Exams
- `GET /api/exam/list` - Get all exams
- `GET /api/exam/:id` - Get exam details
- `POST /api/exam/start` - Start an exam
- `POST /api/exam/submit-answer` - Submit answer
- `POST /api/exam/submit` - Submit completed exam

### Voice Assistant
- `POST /api/voice/speech-to-text` - Convert speech to text
- `POST /api/voice/analyze-answer` - Analyze student answer
- `POST /api/voice/live-suggestion` - Get real-time suggestions
- `POST /api/voice/text-to-speech` - Convert text to speech
- `POST /api/voice/exam-feedback` - Generate exam feedback

### Student Dashboard
- `GET /api/student/dashboard/:studentId` - Student dashboard
- `GET /api/student/exam-history/:studentId` - Exam history
- `POST /api/student/update-exam-result` - Save exam result
- `GET /api/student/analytics/:studentId` - Student analytics

### Placement
- `GET /api/placement/statistics` - Placement stats
- `GET /api/placement/top-performers` - Top students
- `GET /api/placement/company-offers` - Offers by company

## 🔧 Real-Time Features (Socket.IO)

The system uses WebSocket for real-time communication:
- Exam proctoring events
- Live suggestions
- Real-time feedback
- Result notifications

## 🧠 AI Integration

### OpenAI GPT-4
- Answer analysis
- Personalized feedback
- Interview tips

### Google Cloud APIs
- Speech-to-Text
- Text-to-Speech

## 📊 Database

MongoDB with two main models:
- **Student**: Profile, exams, placement info
- **Exam**: Questions, proctoring settings, results

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 💬 Support

For issues and questions, open an issue on GitHub.

---

**Built with ❤️ for Campus Placements**
