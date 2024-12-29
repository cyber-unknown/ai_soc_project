import React, { useState } from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import LogUpload from './LogUpload';
import Dashboard from './Dashboard';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0a1929',
      paper: '#1e293b',
    },
    text: {
      primary: '#fff',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    error: {
      main: '#ff5c7d',
    },
    warning: {
      main: '#ffd740',
    },
    info: {
      main: '#64b5f6',
    },
    success: {
      main: '#69f0ae',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 500,
      color: '#fff',
    },
    h6: {
      fontWeight: 500,
      color: '#90caf9',
    },
    subtitle1: {
      color: '#fff',
    },
    body1: {
      color: 'rgba(255, 255, 255, 0.87)',
    },
    body2: {
      color: 'rgba(255, 255, 255, 0.67)',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 16px',
          '&.MuiButton-contained': {
            backgroundColor: '#90caf9',
            color: '#0a1929',
            '&:hover': {
              backgroundColor: '#64b5f6',
            },
          },
          '&.MuiButton-outlined': {
            borderColor: '#90caf9',
            color: '#90caf9',
            '&:hover': {
              backgroundColor: 'rgba(144, 202, 249, 0.08)',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(255, 255, 255, 0.12)',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e293b',
          borderRadius: 8,
        },
        standardError: {
          backgroundColor: 'rgba(255, 92, 125, 0.15)',
          color: '#ff5c7d',
        },
        standardSuccess: {
          backgroundColor: 'rgba(105, 240, 174, 0.15)',
          color: '#69f0ae',
        },
      },
    },
  },
});

function App() {
  const [analysisResults, setAnalysisResults] = useState(null);

  const handleAnalysisComplete = (results) => {
    // Ensure results is properly formatted before setting state
    if (results && typeof results === 'object') {
      // Convert any complex objects to strings in the anomalies array
      const formattedResults = {
        ...results,
        anomalies: results.anomalies?.map(anomaly => ({
          ...anomaly,
          // Convert any nested objects to strings
          description: typeof anomaly.description === 'object' 
            ? JSON.stringify(anomaly.description) 
            : anomaly.description,
          action: typeof anomaly.action === 'object'
            ? JSON.stringify(anomaly.action)
            : anomaly.action,
          // Ensure other fields are properly formatted
          type: String(anomaly.type || ''),
          severity: String(anomaly.severity || ''),
          timestamp: String(anomaly.timestamp || ''),
          anomaly_score: Number(anomaly.anomaly_score || 0),
          confidence: Number(anomaly.confidence || 0)
        })) || [],
        // Format other fields
        total_logs: Number(results.total_logs || 0),
        total_anomalies: Number(results.total_anomalies || 0),
        anomaly_scores: Array.isArray(results.anomaly_scores) 
          ? results.anomaly_scores.map(Number) 
          : [],
        confidence_scores: Array.isArray(results.confidence_scores)
          ? results.confidence_scores.map(Number)
          : [],
        timestamps: Array.isArray(results.timestamps)
          ? results.timestamps.map(String)
          : [],
        event_stats: results.event_stats || {}
      };
      setAnalysisResults(formattedResults);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 4,
          minHeight: '100vh',
          backgroundColor: 'background.default',
        }}
      >
        <LogUpload onAnalysisComplete={handleAnalysisComplete} />
        {analysisResults && <Dashboard analysisResults={analysisResults} />}
      </Container>
    </ThemeProvider>
  );
}

export default App;
