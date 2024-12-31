import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Stack,
  Chip,
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { Security, Terminal, Warning } from '@mui/icons-material';
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
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [securityAnalysis, setSecurityAnalysis] = useState(null);
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState('');
  const [commandExecuting, setCommandExecuting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

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

  const analyzeSecurityImplications = async (anomaly) => {
    setAnalyzing(true);
    setSelectedAnomaly(anomaly);
    setSecurityDialogOpen(true);
    
    try {
      const response = await fetch('http://localhost:8000/analyze-security', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: typeof anomaly.context === 'object' 
            ? Object.entries(anomaly.context)
                .map(([key, value]) => `${key}: ${value}`)
                .join(' | ')
            : anomaly.context || '',
          score: parseFloat(anomaly.score) || 0,
          confidence: parseFloat(anomaly.confidence) || 0,
          severity: anomaly.severity || 'low'
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to analyze security implications');
      }
      
      const data = await response.json();
      setSecurityAnalysis(data);
    } catch (error) {
      console.error('Security analysis error:', error);
      setSecurityAnalysis({
        analysis: 'Error analyzing security implications. Please try again.',
        commands: []
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const executeCommand = async (command) => {
    setCommandExecuting(true);
    try {
      const response = await fetch('http://localhost:8000/execute-command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      });
      const data = await response.json();
      setCommandOutput(data.success ? data.output : `Error: ${data.error}`);
    } catch (error) {
      setCommandOutput(`Error executing command: ${error.message}`);
    } finally {
      setCommandExecuting(false);
    }
  };

  const handleCloseSecurityDialog = () => {
    setSecurityDialogOpen(false);
    setSelectedAnomaly(null);
    setSecurityAnalysis(null);
  };

  const handleCloseCommandDialog = () => {
    setCommandDialogOpen(false);
    setSelectedCommand('');
    setCommandOutput('');
  };

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

        {/* Anomalies Section */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'background.paper' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom color="text.primary">
                  Latest Anomalies
                </Typography>
                <Stack spacing={2}>
                  {(analysisResults.anomalies || []).map((anomaly, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={4}>
                          <Typography variant="subtitle1" color="text.primary">
                            {anomaly.timestamp}
                          </Typography>
                          <Chip
                            icon={<Warning />}
                            label={anomaly.severity}
                            color={
                              anomaly.severity === 'critical' ? 'error' :
                              anomaly.severity === 'high' ? 'warning' :
                              'info'
                            }
                            size="small"
                            sx={{ mt: 1 }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="body1" color="text.primary">
                            {typeof anomaly.context === 'object' 
                              ? Object.entries(anomaly.context)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(' | ')
                              : anomaly.context}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Score: {anomaly.score} | Confidence: {anomaly.confidence}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} md={2}>
                          <Button
                            variant="contained"
                            startIcon={<Security />}
                            onClick={() => analyzeSecurityImplications(anomaly)}
                            fullWidth
                            color="secondary"
                          >
                            Security Analysis
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Chart Section */}
          <Grid item xs={12}>
            <Card sx={{ bgcolor: 'background.paper', p: 2 }}>
              <Line data={chartData} options={chartOptions} />
            </Card>
          </Grid>
        </Grid>

        {/* Security Analysis Dialog */}
        <Dialog
          open={securityDialogOpen}
          onClose={handleCloseSecurityDialog}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            Security Analysis & Recommendations
            {analyzing && <CircularProgress size={20} sx={{ ml: 2 }} />}
          </DialogTitle>
          <DialogContent>
            {securityAnalysis && (
              <>
                <Typography variant="h6" gutterBottom>Analysis</Typography>
                <Typography variant="body1" paragraph>
                  {securityAnalysis.analysis}
                </Typography>
                
                <Typography variant="h6" gutterBottom>Recommended Security Commands</Typography>
                <Stack spacing={2}>
                  {securityAnalysis.commands?.map((cmd, index) => (
                    <Paper key={index} sx={{ p: 2 }}>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }} display="block" gutterBottom>
                        {cmd.command}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {cmd.description}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Terminal />}
                        onClick={() => {
                          setSelectedCommand(cmd.command);
                          setCommandDialogOpen(true);
                        }}
                      >
                        Execute Command
                      </Button>
                    </Paper>
                  ))}
                </Stack>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseSecurityDialog}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Command Execution Dialog */}
        <Dialog
          open={commandDialogOpen}
          onClose={handleCloseCommandDialog}
        >
          <DialogTitle>Execute Security Command</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to execute this command?
            </DialogContentText>
            <Paper sx={{ p: 2, my: 2, bgcolor: 'grey.100' }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                {selectedCommand}
              </Typography>
            </Paper>
            {commandOutput && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Command Output:
                </Typography>
                <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                    {commandOutput}
                  </Typography>
                </Paper>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCommandDialog}>Cancel</Button>
            <Button 
              onClick={() => executeCommand(selectedCommand)}
              color="primary"
              variant="contained"
              disabled={commandExecuting}
              startIcon={commandExecuting && <CircularProgress size={20} />}
            >
              {commandExecuting ? 'Executing...' : 'Execute'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Dashboard;
