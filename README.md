# AI-Powered Security Operations Center (SOC)

An advanced security monitoring and analysis system that leverages artificial intelligence to detect, analyze, and respond to potential security threats in real-time.

## Features

- **Real-time Monitoring**: Continuously monitors system metrics including CPU usage, memory utilization, request rates, and error rates
- **AI-Powered Analysis**: Uses Google's Gemini AI to analyze security anomalies and provide actionable insights
- **Threat Assessment**: Provides detailed threat assessments with risk levels and potential impact analysis
- **Automated Response**: Generates and executes Windows-compatible security commands
- **Interactive Dashboard**: Modern React-based dashboard for visualizing security metrics and analysis
- **Command Execution**: Secure command execution interface for implementing security measures

## Tech Stack

### Backend
- Python 3.8+
- FastAPI
- Google Gemini AI API
- Uvicorn
- Python-dotenv

### Frontend
- React
- Material-UI (MUI)
- Chart.js
- Axios

## Prerequisites

1. Python 3.8 or higher
2. Node.js 14 or higher
3. Google Cloud API key with Gemini AI access
4. Windows operating system (for command execution)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai_soc_project
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables:
Create a `.env` file in the backend directory with:
```
GOOGLE_API_KEY=your_gemini_api_key
```

4. Set up the frontend:
```bash
cd ../frontend
npm install
```

## Running the Application

1. Start the backend server:
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload
```
The backend will run on `http://localhost:8000`

2. Start the frontend development server:
```bash
cd frontend
npm start
```
The frontend will run on `http://localhost:3000`

## Project Structure

```
ai_soc_project/
├── backend/
│   ├── main.py              # FastAPI application and Gemini AI integration
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.jsx         # Main application component
│   │   ├── Dashboard.jsx   # Security metrics dashboard
│   │   └── AnalysisResult.jsx  # Security analysis display
│   ├── package.json
│   └── public/
└── README.md
```

## Security Analysis Features

### Metrics Monitored
- CPU Usage
- Memory Utilization
- Request Rate
- Error Rate

### Analysis Components
1. **Threat Assessment**
   - Detailed analysis of security anomalies
   - Confidence scoring
   - Severity classification

2. **Impact Analysis**
   - Risk level evaluation
   - Affected components identification
   - Potential consequences assessment

3. **Prevention Measures**
   - Actionable security recommendations
   - Best practices
   - Preventive steps

4. **Mitigation Commands**
   - Windows-compatible security commands
   - Command descriptions and purposes
   - Secure execution interface

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security Considerations

- The application requires administrative privileges for executing certain security commands
- Store API keys securely and never commit them to version control
- Regular updates of dependencies are recommended
- Follow security best practices when executing system commands

## License

[MIT License](LICENSE)

## Support

For support, please open an issue in the repository or contact the development team.