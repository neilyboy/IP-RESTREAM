import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';

// Components
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import StreamsList from './pages/StreamsList';
import StreamPage from './pages/StreamPage';
import Settings from './pages/Settings';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const drawerWidth = drawerOpen ? 240 : 73;

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <Router>
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <Sidebar open={drawerOpen} toggleDrawer={toggleDrawer} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: `calc(100% - ${drawerWidth}px)`,
            background: 'linear-gradient(135deg, #121212 0%, #1e1e1e 100%)',
            height: '100vh',
            overflow: 'auto',
          }}
        >
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/streams" element={<StreamsList />} />
            <Route path="/streams/:id" element={<StreamPage />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
