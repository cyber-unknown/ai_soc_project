# 🛡️ AI-Powered Security Operations Center (SOC)

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000)
![Python](https://img.shields.io/badge/Python-3.8+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-latest-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![Docker](https://img.shields.io/badge/Docker-ready-blue.svg)

</div>

> An intelligent security monitoring and analysis system leveraging Google's Gemini AI to detect, analyze, and respond to security threats in real-time.

## ✨ Features

- 🔍 **Real-time Monitoring** - Track system metrics (CPU, memory, requests, errors)
- 🤖 **AI-Powered Analysis** - Advanced threat detection using Google's Gemini AI
- ⚡ **Instant Response** - Automated security command generation and execution
- 📊 **Interactive Dashboard** - Real-time visualization of security metrics
- 🔐 **Smart Threat Assessment** - Detailed analysis with risk levels and impact evaluation
- 💻 **Windows Integration** - Native support for Windows security commands

## 🚀 Tech Stack

### Backend
- 🐍 Python 3.8+
- ⚡ FastAPI
- 🧠 Google Gemini AI
- 🔄 Uvicorn
- 🌍 Docker

### Frontend
- ⚛️ React 18
- 🎨 Material-UI (MUI)
- 📈 Chart.js
- 🔌 Axios

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- Google Cloud API key (Gemini AI access)
- Windows OS
- Docker (optional)

## 🛠️ Installation

### Using Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/your-username/ai_soc_project.git
cd ai_soc_project

# Configure environment
cp backend/.env.example backend/.env
# Edit .env with your GOOGLE_API_KEY

# Start the application
docker-compose up --build
```

### Manual Setup
```bash
# Backend setup
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Frontend setup
cd ../frontend
npm install
```

## 🚀 Running the Application

### Docker Mode
```bash
docker-compose up
```

### Development Mode
```bash
# Terminal 1 - Backend
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2 - Frontend
cd frontend
npm start
```

Access the application at:
- 🌐 Frontend: http://localhost:3000
- 📡 Backend API: http://localhost:8000
- 📚 API Docs: http://localhost:8000/docs

## 📁 Project Structure

```
ai_soc_project/
├── 🐳 docker-compose.yml        # Docker composition
├── 🐋 Dockerfile               # Docker configuration
│
├── 📂 backend/
│   ├── 📜 main.py             # FastAPI application
│   ├── 📂 models/             # Data models
│   ├── 📂 services/           # Business logic
│   ├── 📂 uploads/            # File storage
│   └── 📝 requirements.txt    # Python dependencies
│
└── 📂 frontend/
    ├── 📂 public/             # Static assets
    └── 📂 src/
        ├── 📱 App.jsx         # Root component
        ├── 📊 Dashboard.jsx   # Metrics display
        ├── 🔍 AnalysisResult.jsx  # Security analysis
        ├── 📤 LogUpload.jsx   # Log file handling
        └── 🎨 App.css         # Styles
```

## 🔒 Security Features

### Monitored Metrics
- 💻 CPU Usage
- 💾 Memory Utilization
- 🌐 Request Rate
- ⚠️ Error Rate

### Analysis Components
1. **🔍 Threat Assessment**
   - Anomaly detection
   - Confidence scoring
   - Severity levels

2. **📊 Impact Analysis**
   - Risk evaluation
   - Component identification
   - Consequence assessment

3. **🛡️ Prevention Measures**
   - Security recommendations
   - Best practices
   - Preventive actions

4. **⚡ Mitigation Commands**
   - Windows security commands
   - Automated execution
   - Command validation

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## ⚠️ Security Considerations

- 🔑 Requires admin privileges for security commands
- 🔒 Never commit API keys to version control
- 🔄 Keep dependencies updated
- ✅ Follow security best practices

## 💬 Support

Need help? Open an issue or contact the development team.