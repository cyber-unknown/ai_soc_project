import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import LogUpload from "./LogUpload";
import Dashboard from "./Dashboard";
import AnalysisResult from "./AnalysisResult";

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
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
        },
      },
    },
  },
});

function App() {
  const [analysisResult, setAnalysisResult] = useState(null);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-4"> AI SOC Log Analyzer </h1>{" "}
          <LogUpload setAnalysisResult={setAnalysisResult} />{" "}
          {analysisResult && <AnalysisResult result={analysisResult} />}{" "}
          <Dashboard analysisResult={analysisResult} />{" "}
        </div>
      </Box>
    </ThemeProvider>
  );
}

export default App;
