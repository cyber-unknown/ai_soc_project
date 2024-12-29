from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from services.log_analyzer import analyze_logs
import os
import plotly.express as px
import pandas as pd

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Update this with your React app's URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "./uploads/"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/upload/")
async def upload_log(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    try:
        with open(file_location, "wb") as buffer:
            buffer.write(await file.read())
        return {"filename": file.filename, "status": "Uploaded"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")

@app.post("/analyze/")
async def analyze_log(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    file_location = os.path.join(UPLOAD_FOLDER, file.filename)
    try:
        result = analyze_logs(file_location)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing logs: {str(e)}")

@app.get("/dashboard/")
async def dashboard():
    try:
        # This is a placeholder. In a real application, you'd aggregate data from multiple log analyses.
        data = pd.DataFrame({
            "threat": ["DDoS", "SQL Injection", "XSS", "Brute Force"],
            "count": [5, 3, 2, 1]
        })
        fig = px.bar(data, x="threat", y="count", title="Threats Detected")
        return HTMLResponse(fig.to_html())
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating dashboard: {str(e)}")

