import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Alert,
  AlertTitle,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import axios from 'axios';

const LogUpload = ({ onAnalysisComplete }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Upload and analyze the file directly
      const response = await axios.post('http://localhost:8000/analyze/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000,
      });

      if (response.data) {
        // Process the response data to ensure all objects are properly stringified
        const processedData = {
          ...response.data,
          anomalies: response.data.anomalies?.map(anomaly => ({
            ...anomaly,
            description: typeof anomaly.description === 'object' 
              ? JSON.stringify(anomaly.description) 
              : String(anomaly.description || ''),
            action: typeof anomaly.action === 'object'
              ? JSON.stringify(anomaly.action)
              : String(anomaly.action || ''),
            type: String(anomaly.type || ''),
            severity: String(anomaly.severity || ''),
            timestamp: String(anomaly.timestamp || ''),
            context: typeof anomaly.context === 'object'
              ? Object.fromEntries(
                  Object.entries(anomaly.context).map(([key, value]) => [
                    key,
                    typeof value === 'object' ? JSON.stringify(value) : String(value)
                  ])
                )
              : {},
          })) || [],
          recommendations: response.data.recommendations?.map(rec => ({
            title: typeof rec.title === 'object' 
              ? JSON.stringify(rec.title) 
              : String(rec.title || ''),
            description: typeof rec.description === 'object'
              ? JSON.stringify(rec.description)
              : String(rec.description || ''),
          })) || [],
          total_logs: Number(response.data.total_logs || 0),
          total_anomalies: Number(response.data.total_anomalies || 0),
          anomaly_scores: Array.isArray(response.data.anomaly_scores)
            ? response.data.anomaly_scores.map(Number)
            : [],
          confidence_scores: Array.isArray(response.data.confidence_scores)
            ? response.data.confidence_scores.map(Number)
            : [],
          timestamps: Array.isArray(response.data.timestamps)
            ? response.data.timestamps.map(String)
            : [],
        };
        onAnalysisComplete(processedData);
      } else {
        throw new Error('Analysis failed: No data received');
      }
    } catch (err) {
      console.error('Error during analysis:', err);
      let errorMessage = 'An error occurred during processing';
      
      if (err.response) {
        errorMessage = err.response.data?.detail || 'Server error: ' + err.response.status;
      } else if (err.request) {
        errorMessage = 'Network error: Could not connect to server';
      } else {
        errorMessage = err.message || 'Error processing file';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          Upload Log File for Analysis
        </Typography>

        <input
          accept=".log,.txt,.csv"
          style={{ display: 'none' }}
          id="log-file-upload"
          type="file"
          onChange={handleFileSelect}
          disabled={loading}
        />

        <label htmlFor="log-file-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUpload />}
            disabled={loading}
            sx={{ mb: 2 }}
          >
            Select Log File
          </Button>
        </label>

        {selectedFile && (
          <Typography variant="body2" color="textSecondary">
            Selected file: {selectedFile.name}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!selectedFile || loading}
          sx={{ mt: 2 }}
        >
          {loading ? (
            <>
              <CircularProgress size={24} sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            'Upload and Analyze'
          )}
        </Button>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: '100%' }}>
            <AlertTitle>Error</AlertTitle>
            {error}
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default LogUpload;
