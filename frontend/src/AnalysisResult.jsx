import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Divider
} from '@mui/material';
import { Warning, Error, CheckCircle, Analytics, Security, Terminal } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import ReactMarkdown from 'react-markdown';

const AnalysisResult = ({ result, loading, error, onClose, onExecuteCommand }) => {
  const [analysisDialogOpen, setAnalysisDialogOpen] = useState(false);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [securityDialogOpen, setSecurityDialogOpen] = useState(false);
  const [securityAnalysis, setSecurityAnalysis] = useState(null);
  const [commandDialogOpen, setCommandDialogOpen] = useState(false);
  const [selectedCommand, setSelectedCommand] = useState('');
  const [commandOutput, setCommandOutput] = useState('');
  const [commandExecuting, setCommandExecuting] = useState(false);

  if (error) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">
          {typeof error === 'string' ? error : 'An error occurred during analysis. Please try again.'}
        </Alert>
      </Box>
    );
  }

  if (!result) return null;

  const analyzeWithGemini = async (anomaly) => {
    setAnalyzing(true);
    setSelectedAnomaly(anomaly);
    setAnalysisDialogOpen(true);
    
    try {
      const response = await fetch('http://localhost:8000/analyze-anomaly', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: anomaly.context,
          score: anomaly.score,
          confidence: anomaly.confidence,
          severity: anomaly.severity,
        }),
      });
      
      const data = await response.json();
      setGeminiAnalysis(data.analysis);
    } catch (error) {
      setGeminiAnalysis('Error analyzing anomaly. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

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
          context: anomaly.context,
          score: anomaly.score,
          confidence: anomaly.confidence,
          severity: anomaly.severity,
        }),
      });
      
      const data = await response.json();
      setSecurityAnalysis(data);
    } catch (error) {
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

  const handleCloseDialog = () => {
    setAnalysisDialogOpen(false);
    setSelectedAnomaly(null);
    setGeminiAnalysis('');
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

  const renderLine = (line, index) => {
    // Skip empty lines
    if (!line.trim()) return null;

    // Handle key-value pairs (e.g., "Risk Level: Medium")
    if (line.includes(':')) {
      const [key, value] = line.split(':').map(part => part.trim());
      return (
        <Box 
          key={index} 
          sx={{ 
            display: 'flex',
            alignItems: 'flex-start',
            mb: 1,
            pl: 2
          }}
        >
          <Typography 
            component="span" 
            sx={{ 
              fontWeight: 'bold',
              color: '#1976d2',
              minWidth: '180px'
            }}
          >
            {key}:
          </Typography>
          <Typography 
            component="span" 
            sx={{ 
              flex: 1,
              pl: 1
            }}
          >
            {value}
          </Typography>
        </Box>
      );
    }

    // Handle numbered list items
    if (line.match(/^\d+\./)) {
      const [number, ...textParts] = line.split('.');
      const text = textParts.join('.').trim();
      
      return (
        <Box 
          key={index}
          sx={{ 
            display: 'flex',
            alignItems: 'flex-start',
            mb: 1.5,
            pl: 2
          }}
        >
          <Typography 
            component="span" 
            sx={{ 
              color: '#1976d2',
              minWidth: '32px',
              fontWeight: 'bold',
              fontSize: '1rem'
            }}
          >
            {number}.
          </Typography>
          <Typography 
            component="span" 
            sx={{ 
              flex: 1,
              pl: 1,
              fontSize: '1rem'
            }}
          >
            {text}
          </Typography>
        </Box>
      );
    }

    // Default text rendering
    return (
      <Typography 
        key={index} 
        sx={{ 
          mb: 1,
          pl: 2
        }}
      >
        {line}
      </Typography>
    );
  };

  const renderSection = (title, content) => {
    return (
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            color: '#1976d2',
            fontWeight: 'bold',
            mb: 2,
            pb: 1,
            borderBottom: '2px solid #1976d2'
          }}
        >
          {title}
        </Typography>
        <Box>
          {content.split('\n').map((line, index) => renderLine(line, index))}
        </Box>
      </Box>
    );
  };

  const renderAnalysis = (analysis) => {
    if (!analysis) return null;

    const sections = analysis.split('\n\n');
    const formattedSections = {};
    
    let currentSection = null;
    sections.forEach(section => {
      const lines = section.split('\n');
      const title = lines[0].trim();
      
      if (['THREAT ASSESSMENT', 'IMPACT ANALYSIS', 'PREVENTION MEASURES'].includes(title)) {
        currentSection = title;
        formattedSections[currentSection] = lines.slice(1).join('\n');
      }
    });

    return (
      <Box>
        {Object.entries(formattedSections).map(([title, content]) => 
          renderSection(title, content)
        )}
      </Box>
    );
  };

  const markdownComponents = {
    h2: ({ children }) => (
      <Typography 
        variant="h5" 
        sx={{ 
          mt: 3, 
          mb: 2, 
          color: '#1976d2',
          fontWeight: 'bold' 
        }}
      >
        {children}
      </Typography>
    ),
    h3: ({ children }) => (
      <Typography 
        variant="h6" 
        sx={{ 
          mt: 2, 
          mb: 1, 
          color: '#2196f3' 
        }}
      >
        {children}
      </Typography>
    ),
    p: ({ children }) => (
      <Typography 
        variant="body1" 
        sx={{ 
          mb: 1,
          lineHeight: 1.6
        }}
      >
        {children}
      </Typography>
    ),
    li: ({ children }) => (
      <Typography 
        component="li" 
        sx={{ 
          mb: 0.5,
          '&::marker': {
            color: '#1976d2'
          }
        }}
      >
        {children}
      </Typography>
    ),
    strong: ({ children }) => (
      <Box 
        component="strong" 
        sx={{ 
          color: '#1976d2',
          fontWeight: 'bold'
        }}
      >
        {children}
      </Box>
    )
  };

  const anomalyTimeSeriesData = {
    labels: result.timestamps || [],
    datasets: [
      {
        label: 'Anomaly Score',
        data: result.anomaly_scores || [],
        fill: false,
        borderColor: '#f48fb1',
        tension: 0.1,
      },
    ],
  };

  const getSeverityColor = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity.toLowerCase()) {
      case 'critical':
        return <Error />;
      case 'high':
        return <Warning />;
      default:
        return <CheckCircle />;
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom color="primary">
        Analysis Results
      </Typography>

      <Grid container spacing={3}>
        {/* Anomaly Score Timeline */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Anomaly Score Timeline
              </Typography>
              <Line data={anomalyTimeSeriesData} options={{ responsive: true }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Detected Anomalies */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Detected Anomalies
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Timestamp</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Severity</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(result.anomalies || []).map((anomaly, index) => (
                      <TableRow key={index}>
                        <TableCell>{anomaly.timestamp}</TableCell>
                        <TableCell>{anomaly.type}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getSeverityIcon(anomaly.severity)}
                            label={anomaly.severity}
                            color={getSeverityColor(anomaly.severity)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{anomaly.description}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Analytics />}
                              onClick={() => analyzeWithGemini(anomaly)}
                              color="primary"
                            >
                              Analyze
                            </Button>
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<Security />}
                              onClick={() => analyzeSecurityImplications(anomaly)}
                              color="secondary"
                            >
                              Security
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Summary Statistics
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Logs Analyzed
                  </Typography>
                  <Typography variant="h4">
                    {result.total_logs || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Anomalies Detected
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {result.total_anomalies || 0}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Analysis Duration
                  </Typography>
                  <Typography variant="h4">
                    {result.analysis_duration || '0'} s
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recommendations
              </Typography>
              <Stack spacing={2}>
                {(result.recommendations || []).map((rec, index) => (
                  <Paper key={index} sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="subtitle1" gutterBottom>
                      {rec.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {rec.description}
                    </Typography>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gemini Analysis Dialog */}
      <Dialog
        open={analysisDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Anomaly Analysis
          {analyzing && <CircularProgress size={20} sx={{ ml: 2 }} />}
        </DialogTitle>
        <DialogContent>
          {selectedAnomaly && (
            <DialogContentText sx={{ mb: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Context: {selectedAnomaly.context}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Score: {selectedAnomaly.score} | Confidence: {selectedAnomaly.confidence} | Severity: {selectedAnomaly.severity}
              </Typography>
            </DialogContentText>
          )}
          <Typography variant="body1">
            {analyzing ? 'Analyzing anomaly...' : geminiAnalysis}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Security Analysis Dialog */}
      <Dialog
        open={securityDialogOpen}
        onClose={handleCloseSecurityDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '90vh'
          }
        }}
      >
        <DialogTitle>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              color: '#1976d2',
              fontWeight: 'bold',
              borderBottom: '2px solid #1976d2',
              pb: 1
            }}
          >
            Security Analysis Report
          </Typography>
        </DialogTitle>

        <DialogContent>
          {analyzing ? (
            <Box sx={{ p: 2, textAlign: 'center' }}>
              <Typography>Analyzing security implications...</Typography>
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  mb: 3
                }}
              >
                {renderAnalysis(securityAnalysis?.analysis)}
              </Paper>

              {securityAnalysis?.commands?.length > 0 && (
                <>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      color: '#1976d2',
                      fontWeight: 'bold',
                      mb: 2,
                      pb: 1,
                      borderBottom: '2px solid #1976d2'
                    }}
                  >
                    Mitigation Commands
                  </Typography>
                  
                  {securityAnalysis.commands.map((cmd, index) => (
                    <Paper 
                      key={index} 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        mb: 2,
                        backgroundColor: '#f8f9fa',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2
                      }}
                    >
                      <Box 
                        component="pre"
                        sx={{
                          backgroundColor: '#e3f2fd',
                          p: 2,
                          borderRadius: 1,
                          overflowX: 'auto',
                          border: '1px solid #bbdefb',
                          fontFamily: 'Consolas, Monaco, monospace',
                          fontSize: '0.9rem',
                          mb: 1.5
                        }}
                      >
                        {cmd.command}
                      </Box>
                      
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#546e7a',
                          mb: 1.5,
                          fontStyle: 'italic',
                          pl: 1
                        }}
                      >
                        {cmd.description}
                      </Typography>
                      
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onExecuteCommand(cmd.command)}
                        sx={{
                          backgroundColor: '#1976d2',
                          '&:hover': {
                            backgroundColor: '#1565c0'
                          }
                        }}
                      >
                        Execute Command
                      </Button>
                    </Paper>
                  ))}
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={onClose} 
            sx={{ 
              color: '#1976d2',
              fontWeight: 'medium'
            }}
          >
            Close
          </Button>
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
  );
};

export default AnalysisResult;
