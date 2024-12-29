import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Stack,
  Alert,
} from '@mui/material';
import { CloudUpload, CheckCircle } from '@mui/icons-material';
import axios from 'axios';

function LogUpload({ setAnalysisResult }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      setAnalysisResult(response.data);
      setUploading(false);
    } catch (error) {
      setError('Error uploading file: ' + error.message);
      setUploading(false);
    }
  };

  return (
    <Card sx={{ mb: 3, borderRadius: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom color="primary">
          Upload Log Files
        </Typography>
        
        <Box
          sx={{
            border: '2px dashed #90caf9',
            borderRadius: 2,
            p: 3,
            mt: 2,
            mb: 3,
            textAlign: 'center',
            bgcolor: 'background.paper',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
          component="label"
        >
          <input
            type="file"
            accept=".log,.txt"
            hidden
            onChange={handleFileChange}
          />
          <Stack spacing={2} alignItems="center">
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
            <Typography variant="body1">
              {file ? file.name : 'Drag and drop your log file here or click to browse'}
            </Typography>
            {file && (
              <Typography variant="caption" color="success.main">
                <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
                File selected
              </Typography>
            )}
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ width: '100%', mb: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Uploading... {uploadProgress}%
            </Typography>
          </Box>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || uploading}
          fullWidth
          size="large"
          sx={{ 
            mt: 2,
            height: 48,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1.1rem'
          }}
        >
          {uploading ? 'Uploading...' : 'Analyze Logs'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default LogUpload;
