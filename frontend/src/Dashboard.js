import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Tabs,
  Tab,
  Paper,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Timeline,
  Assessment,
  Security,
  Warning,
  TrendingUp,
} from '@mui/icons-material';
import {
  Line,
  Bar,
  Doughnut,
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index} style={{ padding: '20px 0' }}>
      {value === index && children}
    </div>
  );
}

function Dashboard({ analysisResult }) {
  const [tabValue, setTabValue] = useState(0);
  const [selectedMetric, setSelectedMetric] = useState('anomalies');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Mock data - replace with actual data from backend
  const anomalyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Anomaly Score',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: '#f48fb1',
        tension: 0.1,
      },
    ],
  };

  const severityDistribution = {
    labels: ['Critical', 'High', 'Medium', 'Low'],
    datasets: [
      {
        data: [12, 19, 3, 5],
        backgroundColor: ['#f44336', '#ff9800', '#ffc107', '#4caf50'],
      },
    ],
  };

  const timeSeriesData = {
    labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    datasets: [
      {
        label: 'Log Volume',
        data: [120, 190, 300, 250, 280, 150],
        backgroundColor: '#90caf9',
      },
    ],
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Header Stats */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                Total Logs
              </Typography>
              <Typography variant="h4">24,583</Typography>
              <LinearProgress variant="determinate" value={70} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="error">
                Anomalies
              </Typography>
              <Typography variant="h4">127</Typography>
              <LinearProgress color="error" variant="determinate" value={30} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning">
                Alerts
              </Typography>
              <Typography variant="h4">45</Typography>
              <LinearProgress color="warning" variant="determinate" value={45} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success">
                Processing Rate
              </Typography>
              <Typography variant="h4">98.5%</Typography>
              <LinearProgress color="success" variant="determinate" value={98} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        </Grid>

        {/* Tabs Navigation */}
        <Grid item xs={12}>
          <Paper sx={{ width: '100%' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab icon={<Timeline />} label="Time Series" />
              <Tab icon={<Assessment />} label="Analysis" />
              <Tab icon={<Security />} label="Security" />
            </Tabs>
          </Paper>
        </Grid>

        {/* Tab Panels */}
        <Grid item xs={12}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Anomaly Score Over Time
                    </Typography>
                    <Line data={anomalyData} options={{ responsive: true }} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Log Volume Distribution
                    </Typography>
                    <Bar data={timeSeriesData} options={{ responsive: true }} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Severity Distribution
                    </Typography>
                    <Doughnut data={severityDistribution} options={{ responsive: true }} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Alert severity="warning">
                  3 Critical security alerts detected in the last 24 hours
                </Alert>
                {/* Add more security-related components here */}
              </Grid>
            </Grid>
          </TabPanel>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Dashboard;
