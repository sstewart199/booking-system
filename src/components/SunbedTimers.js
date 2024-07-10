import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Box, Typography, Paper, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from './authentication/api';
import config from '../config';

const SunbedTimer = ({ timerData }) => {
  const { type, isPlaying, duration, initialRemainingTime, waitingClients, totalWaitTime } = timerData;

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper', mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {type === 'lie-down' ? 'Lie-down Sunbed' : 'Stand-up Sunbed'}
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <CountdownCircleTimer
          key={initialRemainingTime}
          isPlaying={isPlaying}
          duration={duration}
          initialRemainingTime={initialRemainingTime}
          colors={['#004777', '#F7B801', '#A30000', '#A30000']}
          colorsTime={[7 * 60, 5 * 60, 2 * 60, 0]}
          size={120}
        >
          {({ remainingTime }) => (
            <Typography variant="body1">
              {Math.floor(remainingTime / 60)}:{String(remainingTime % 60).padStart(2, '0')}
            </Typography>
          )}
        </CountdownCircleTimer>
      </Box>
      <Typography variant="body2" align="center">
        Waiting Clients: {waitingClients}
      </Typography>
      <Typography variant="body2" align="center">
        Total Wait Time: {Math.floor(totalWaitTime / 60)}:{String(totalWaitTime % 60).padStart(2, '0')}
      </Typography>
    </Paper>
  );
};

const SunbedTimers = () => {
  const [isExpanded, setIsExpanded] = useState(() => {
    return localStorage.getItem('sunbedTimersExpanded') !== 'false';
  });
  const [timerData, setTimerData] = useState({
    'lie-down': null,
    'stand-up': null
  });

  const toggleExpanded = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    localStorage.setItem('sunbedTimersExpanded', newExpandedState.toString());
  };

  useEffect(() => {
    const fetchTimerData = async () => {
      try {
        const [lieDownResponse, standUpResponse] = await Promise.all([
          api.get(`${config.apiUrl}/sunbed-timer/lie-down`),
          api.get(`${config.apiUrl}/sunbed-timer/stand-up`)
        ]);

        const processTimerData = (response, type) => {
          const { currentSession, waitingClients } = response.data;
          if (!currentSession) return null;

          const purchaseDate = new Date(currentSession.purchaseDate);
          const now = new Date();
          const elapsedSeconds = Math.floor((now - purchaseDate) / 1000);
          const totalSessionSeconds = (currentSession.minutes + 2) * 60; // Including 2 minutes for dressing/undressing
          const remainingSeconds = Math.max(0, totalSessionSeconds - elapsedSeconds);
          
          const totTime = (waitingClients.reduce((total, client) => total + (client.minutes*60) + 120, 0)) + remainingSeconds;

          return {
            type,
            isPlaying: remainingSeconds > 0,
            duration: totalSessionSeconds,
            initialRemainingTime: remainingSeconds,
            waitingClients: waitingClients.length,
            totalWaitTime: totTime
          };
        };

        setTimerData({
          'lie-down': processTimerData(lieDownResponse, 'lie-down'),
          'stand-up': processTimerData(standUpResponse, 'stand-up')
        });
      } catch (error) {
        console.error('Error fetching timer data:', error);
      }
    };

    fetchTimerData();
    const interval = setInterval(fetchTimerData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const hasActiveTimers = timerData['lie-down'] !== null || timerData['stand-up'] !== null;

  if (!hasActiveTimers) {
    return null; // Hide the component when there are no active timers
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 50,
        left: 0,
        zIndex: 1000,
        display: 'flex',
        transition: 'transform 0.3s ease-in-out',
        transform: isExpanded ? 'translateX(0)' : 'translateX(-280px)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          backgroundColor: 'background.paper',
          borderTopRightRadius: 8,
          borderBottomRightRadius: 8,
          boxShadow: 3,
          p: 2,
          width: 280,
        }}
      >
        {timerData['lie-down'] && <SunbedTimer timerData={timerData['lie-down']} />}
        {timerData['stand-up'] && <SunbedTimer timerData={timerData['stand-up']} />}
      </Box>
      <IconButton
        onClick={toggleExpanded}
        sx={{
          position: 'absolute',
          right: -40,
          top: '50%',
          transform: 'translateY(-50%)',
          backgroundColor: 'background.paper',
          '&:hover': {
            backgroundColor: 'action.hover',
          },
          boxShadow: 2,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        {isExpanded ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>
    </Box>
  );
};

export default SunbedTimers;