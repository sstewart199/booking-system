import React, { useEffect, useState } from 'react';
import TanningSalonInterface from './TanningSalonInterface';
import SalesScreen from './SalesScreen';
import ProductsManagementScreen from './ProductsManagementScreen';
import LoginScreen from './LoginScreen';
import StaffManagementScreen from './StaffManagementScreen';
import CustomerHistoryScreen from './CustomerHistoryScreen';
import LogoutButton from './components/LogoutButton';
import UsernameButton from './components/UsernameButton';
import NavLinks from './components/NavLinks';
import SunbedTimers from './components/SunbedTimers';  // Import the new component
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import PrivateRoute from './components/authentication/PrivateRoute';
import AdminRoute from './components/authentication/AdminRoute';
import axios from 'axios';
import {
  Box,
  Card,
  CssBaseline,
  Switch,
  ThemeProvider,
  Typography,
  AppBar,
  Toolbar,
  Container,
  Chip,
} from '@mui/material';
import { Sun, Moon } from "lucide-react";
import { lightTheme, darkTheme } from './styles';
import config from './config';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);

  const ConditionalSunbedTimers = () => {
    const location = useLocation();
    return location.pathname !== '/login' ? <SunbedTimers /> : null;
  };

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get(`${config.apiUrl}/user`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserRole(response.data.role);
        setUsername(response.data.username);
      } else {
        setUserRole(null);
        setUsername(null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      setUsername(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUserRole(null);
    setUsername(null);
    window.location.href = '/login';
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    window.location.href = '/';
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const theme = darkMode ? darkTheme : lightTheme;

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
          <AppBar position="static" color="transparent" elevation={0} sx={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <Toolbar>
              <Typography
                variant="h4"
                component="div"
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.text.primary // Change this line
                }}
              >
                <a href="/" onClick={handleHomeClick} style={{ color: 'inherit', textDecoration: 'none', marginRight: '16px' }}>
                  <Sun style={{ marginRight: '8px' }} /> Hutt Beauty
                </a>
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NavLinks userRole={userRole} />
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                  <Sun size={16} color={theme.palette.text.secondary} />
                  <Switch
                    checked={darkMode}
                    onChange={toggleDarkMode}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: theme.palette.primary.main,
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: theme.palette.primary.main,
                      },
                    }}
                  />
                  <Moon size={16} color={theme.palette.text.secondary} />
                </Box>
              </Box>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Card sx={{ backgroundColor: theme.palette.background.paper, boxShadow: 'none', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <Routes>
                <Route path="/" element={<PrivateRoute><TanningSalonInterface /></PrivateRoute>} />
                <Route path="/sales" element={<PrivateRoute><SalesScreen userRole={userRole} /></PrivateRoute>} />
                <Route path="/products" element={<PrivateRoute><ProductsManagementScreen /></PrivateRoute>} />
                <Route path="/login" element={<LoginScreen fetchUserRole={fetchUser} />} />
                <Route path="/staff" element={<AdminRoute userRole={userRole}><StaffManagementScreen /></AdminRoute>} />
                <Route path="/customer-history" element={<CustomerHistoryScreen userRole={userRole}/>} />
              </Routes>
            </Card>
          </Container>
          <Box sx={{ position: 'fixed', bottom: 16, left: 16, zIndex: 1000 }}>
            {username && (
              <Chip
                label={username}
                color="primary"
                sx={{
                  height: '28px',
                  borderRadius: '14px',
                  fontSize: '0.875rem',
                  fontWeight: 'medium',
                  '& .MuiChip-label': {
                    px: 2,
                  },
                }}
              />
            )}
          </Box>
          <UsernameButton username={username} />
          <LogoutButton handleLogout={handleLogout} />
          <ConditionalSunbedTimers />
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App;