import React from 'react';
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
} from '@mui/material';
import { Warning, Error, CheckCircle } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';

function AnalysisResult({ result }) {
  if (!result) return null;

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
                      <TableCell>Action</TableCell>
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
                          <Chip
                            label={anomaly.action || 'No action required'}
                            variant="outlined"
                            size="small"
                          />
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
    </Box>
  );
}

export default AnalysisResult;
