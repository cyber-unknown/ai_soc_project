from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import shutil
from services.log_analyzer import analyze_logs
import json
import pandas as pd
import logging
import google.generativeai as genai
from pydantic import BaseModel
from typing import Optional
import asyncio

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.warning("GOOGLE_API_KEY not found in environment variables")
genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-pro')

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

class AnomalyAnalysisRequest(BaseModel):
    context: str
    score: float
    confidence: float
    severity: str

class SecurityAnalysisRequest(BaseModel):
    context: str
    score: float
    confidence: float
    severity: str

class CommandRequest(BaseModel):
    command: str

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    try:
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        return {"filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/analyze/")
async def analyze_file(file: UploadFile = File(...)):
    try:
        # Save the uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Analyze the file
        results = analyze_logs(file_path)
        return results
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=422, detail=str(e))

@app.post("/analyze-anomaly")
async def analyze_anomaly(request: AnomalyAnalysisRequest):
    try:
        # Create a prompt for Gemini
        prompt = f"""
        Analyze this system log anomaly and provide insights:
        
        Context: {request.context}
        Anomaly Score: {request.score}
        Confidence: {request.confidence}
        Severity: {request.severity}
        
        Please provide:
        1. Likely cause of the anomaly
        2. Potential impact on the system
        3. Recommended actions
        4. Prevention measures
        """
        
        # Get response from Gemini
        response = model.generate_content(prompt)
        analysis = response.text
        
        return {"analysis": analysis}
    except Exception as e:
        logger.error(f"Error in Gemini analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-security")
async def analyze_security(request: SecurityAnalysisRequest):
    try:
        # Log the incoming request for debugging
        logger.info(f"Received security analysis request: {request}")

        # Validate request data
        if not request.context:
            raise HTTPException(status_code=422, detail="Context is required")
        if not isinstance(request.score, (int, float)):
            raise HTTPException(status_code=422, detail="Score must be a number")
        if not isinstance(request.confidence, (int, float)):
            raise HTTPException(status_code=422, detail="Confidence must be a number")
        if not request.severity:
            raise HTTPException(status_code=422, detail="Severity is required")

        # Create a security-focused prompt for Gemini
        prompt = f"""
        Based on this system log anomaly, provide specific Windows commands to address and mitigate the security issues.

        Input Data:
        Context: {request.context}
        Score: {request.score}
        Confidence: {request.confidence}
        Severity: {request.severity}

        Please provide your analysis in this exact format:

        THREAT ASSESSMENT
        [Brief overview of the security threat]

        IMPACT ANALYSIS
        Risk Level: [Critical/High/Medium/Low]
        Affected Components: [List components]
        Potential Consequences: [List consequences]

        MITIGATION COMMANDS

        Immediate Actions:
        COMMAND: [Windows command]
        DESCRIPTION: [What this command does]

        System Hardening:
        COMMAND: [Windows command]
        DESCRIPTION: [What this command does]

        Monitoring Setup:
        COMMAND: [Windows command]
        DESCRIPTION: [What this command does]

        PREVENTION MEASURES
        [1] [First measure]
        [2] [Second measure]
        [3] [Third measure]

        Note: Provide only Windows-compatible commands that directly address the detected anomaly.
        Include specific parameters and values, not placeholders.
        """

        # Get response from Gemini
        response = model.generate_content(
            prompt,
            safety_settings={
                "HARM_CATEGORY_DANGEROUS_CONTENT": "BLOCK_NONE",
                "HARM_CATEGORY_HATE_SPEECH": "BLOCK_NONE",
                "HARM_CATEGORY_HARASSMENT": "BLOCK_NONE",
                "HARM_CATEGORY_SEXUALLY_EXPLICIT": "BLOCK_NONE"
            }
        )
        
        if not response:
            raise HTTPException(
                status_code=500, 
                detail="Failed to get response from Gemini API"
            )

        # Check if response has content
        if not hasattr(response, 'text') or not response.text:
            # Return a default analysis if Gemini fails
            return {
                "analysis": f"""
THREAT ASSESSMENT
High CPU ({request.context.get('CPU', 'N/A')}) and memory ({request.context.get('MEM', 'N/A')}) utilization detected.

IMPACT ANALYSIS
Risk Level: {request.severity}
Affected Components: CPU, Memory, System Resources
Potential Consequences: System performance degradation, potential service disruption

PREVENTION MEASURES
1. Monitor and terminate resource-intensive processes
2. Update system security patches
3. Review system logs for suspicious activities
""".strip(),
                "commands": [
                    {
                        "command": "tasklist /v",
                        "description": "[Immediate Actions] Lists all running processes with their resource usage"
                    },
                    {
                        "command": "wmic process where 'PercentProcessorTime > 50' get Caption,ProcessId,PercentProcessorTime",
                        "description": "[Monitoring] Shows processes using more than 50% CPU"
                    },
                    {
                        "command": "Get-EventLog -LogName System -EntryType Error -Newest 10",
                        "description": "[Analysis] Retrieves recent system error logs for investigation"
                    }
                ]
            }

        # Parse the response into structured sections
        analysis = response.text
        sections = {}
        current_section = None
        current_command = None
        commands = []

        for line in analysis.split('\n'):
            line = line.strip()
            if not line:
                continue

            # Handle main sections
            if line in ['THREAT ASSESSMENT', 'IMPACT ANALYSIS', 'MITIGATION COMMANDS', 'PREVENTION MEASURES']:
                current_section = line
                sections[current_section] = []
                continue

            # Handle command sections
            if line.endswith(':') and line in ['Immediate Actions:', 'System Hardening:', 'Monitoring Setup:']:
                current_command = line[:-1]
                continue

            if current_command and line.startswith('COMMAND:'):
                cmd = line.replace('COMMAND:', '').strip()
                continue

            if current_command and line.startswith('DESCRIPTION:'):
                desc = line.replace('DESCRIPTION:', '').strip()
                commands.append({
                    'command': cmd,
                    'description': f'[{current_command}] {desc}'
                })
                current_command = None
                continue

            # Format prevention measures as a list
            if current_section == 'PREVENTION MEASURES' and line.startswith('['):
                # Keep the square brackets format from the input
                sections[current_section].append(line)
            else:
                sections[current_section].append(line)

        # Format the analysis in a clean way
        formatted_analysis = []
        
        if 'THREAT ASSESSMENT' in sections:
            formatted_analysis.append('THREAT ASSESSMENT')
            formatted_analysis.extend(sections['THREAT ASSESSMENT'])
            formatted_analysis.append('')

        if 'IMPACT ANALYSIS' in sections:
            formatted_analysis.append('IMPACT ANALYSIS')
            formatted_analysis.extend(sections['IMPACT ANALYSIS'])
            formatted_analysis.append('')

        if 'PREVENTION MEASURES' in sections:
            formatted_analysis.append('PREVENTION MEASURES')
            # Format prevention measures with proper numbering
            measures = sections['PREVENTION MEASURES']
            formatted_measures = []
            for measure in measures:
                if measure.startswith('[') and ']' in measure:
                    # Extract the number and text
                    number = measure[1:measure.index(']')]
                    text = measure[measure.index(']')+1:].strip()
                    formatted_measures.append(f"{number}. {text}")
                else:
                    formatted_measures.append(measure)
            formatted_analysis.extend(formatted_measures)

        return {
            "analysis": '\n'.join(formatted_analysis),
            "commands": commands
        }
        
    except Exception as e:
        logger.error(f"Error in security analysis: {str(e)}")
        # Return a simplified analysis in case of errors
        return {
            "analysis": f"""
THREAT ASSESSMENT
Detected anomaly in system metrics.

IMPACT ANALYSIS
Risk Level: {request.severity}
Affected Components: System Resources
Potential Consequences: Performance impact

PREVENTION MEASURES
1. Monitor system resources
2. Review security logs
3. Update system security
""".strip(),
            "commands": [
                {
                    "command": "tasklist /v",
                    "description": "[Basic Analysis] Lists all running processes"
                }
            ]
        }

@app.post("/execute-command")
async def execute_command(request: CommandRequest):
    try:
        # IMPORTANT: Implement proper security validation here
        # Only allow specific security-related commands
        allowed_commands = {
            "netsh advfirewall",
            "wf.msc",
            "netsh firewall",
            "sc",
            "reg"
        }
        
        # Basic security check
        command_base = request.command.split()[0].lower()
        if not any(request.command.lower().startswith(cmd.lower()) for cmd in allowed_commands):
            raise HTTPException(
                status_code=400,
                detail="Command not allowed. Only security configuration commands are permitted."
            )
        
        # Execute command and capture output
        process = await asyncio.create_subprocess_shell(
            request.command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0:
            return {
                "success": True,
                "output": stdout.decode(),
                "command": request.command
            }
        else:
            return {
                "success": False,
                "error": stderr.decode(),
                "command": request.command
            }
    except Exception as e:
        logger.error(f"Error executing command: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test-gemini")
async def test_gemini():
    try:
        # Test the Gemini API with a simple prompt
        response = model.generate_content("Hello! Please respond with a simple 'Hello, I'm working!'")
        if response and response.text:
            return {"status": "success", "message": response.text}
        else:
            return {"status": "error", "message": "No response from Gemini"}
    except Exception as e:
        logger.error(f"Gemini test error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Gemini API error: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Log Analysis API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
