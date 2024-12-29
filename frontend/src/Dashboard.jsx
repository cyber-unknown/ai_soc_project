import React, { useState } from 'react';
import { Box, Container, Typography, Paper, Grid, Card, CardContent, Alert, CircularProgress } from '@mui/material';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = ({ analysisResults, loading, error }) => {
  // Early return for loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <Alert severity="error">
        {typeof error === 'object' ? JSON.stringify(error) : error}
      </Alert>
    );
  }

  // Early return if no results
  if (!analysisResults) {
    return (
      <Alert severity="info">
        Upload and analyze a log file to see the results.
      </Alert>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: Array.from({ length: analysisResults.anomaly_scores?.length || 0 }, (_, i) => i + 1),
    datasets: [
      {
        label: 'Anomaly Scores',
        data: analysisResults.anomaly_scores || [],
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
      {
        label: 'Confidence Scores',
        data: analysisResults.confidence_scores || [],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Log Analysis Results',
        color: '#fff',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#fff',
        },
      },
    },
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" component="div" color="text.primary">
                  Total Logs
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {analysisResults.total_logs || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" component="div" color="text.primary">
                  Anomalies Detected
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {analysisResults.total_anomalies || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" component="div" color="text.primary">
                  Average Confidence
                </Typography>
                <Typography variant="h4" color="text.primary">
                  {analysisResults.confidence_scores ? 
                    (analysisResults.confidence_scores.reduce((a, b) => a + b, 0) / 
                    analysisResults.confidence_scores.length).toFixed(2) : 
                    '0.00'
                  }
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Chart */}
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'background.paper' }}>
          <Line data={chartData} options={chartOptions} />
        </Paper>

        {/* Anomalies List */}
        <Paper sx={{ p: 2, mb: 4, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            Detected Anomalies
          </Typography>
          {analysisResults.anomalies && analysisResults.anomalies.length > 0 ? (
            analysisResults.anomalies.map((anomaly, index) => (
              <Alert 
                key={index}
                severity={anomaly.severity?.toLowerCase() === 'high' ? 'error' : 'warning'}
                sx={{ mb: 1 }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  {anomaly.description || 'Anomaly detected'}
                </Typography>
                <Typography variant="body2">
                  Score: {(anomaly.anomaly_score || 0).toFixed(2)} | 
                  Confidence: {(anomaly.confidence || 0).toFixed(2)} | 
                  Severity: {anomaly.severity || 'Unknown'}
                </Typography>
                {anomaly.context && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      Context: {Object.entries(anomaly.context).map(([key, value]) => 
                        `${key}: ${value}`).join(' | ')}
                    </Typography>
                  </Box>
                )}
              </Alert>
            ))
          ) : (
            <Alert severity="info">No anomalies detected</Alert>
          )}
        </Paper>

        {/* Recommendations */}
        <Paper sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" gutterBottom color="text.primary">
            Recommendations
          </Typography>
          {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
            analysisResults.recommendations.map((recommendation, index) => (
              <Alert key={index} severity="info" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {recommendation.title || 'Recommendation'}
                </Typography>
                <Typography variant="body2">
                  {recommendation.description || ''}
                </Typography>
              </Alert>
            ))
          ) : (
            <Alert severity="info">No recommendations available</Alert>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;
