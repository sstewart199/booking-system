import React, { useState, useEffect } from 'react';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { Box, Typography, Paper } from '@mui/material';
import api from './authentication/api';
import config from '../config';

const SunbedTimer = ({ type }) => {
  const [timerKey, setTimerKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [initialRemainingTime, setInitialRemainingTime] = useState(0);
  const [waitingClients, setWaitingClients] = useState(0);
  const [totalWaitTime, setTotalWaitTime] = useState(0);

  useEffect(() => {
    const fetchTimerData = async () => {
      try {
        const response = await api.get(`${config.apiUrl}/sunbed-timer/${type}`);
        const { currentSession, waitingClients } = response.data;
        let remainingSeconds = 0;
        
        if (currentSession) {
          const purchaseDate = new Date(currentSession.purchaseDate);
          const now = new Date();
          const elapsedSeconds = Math.floor((now - purchaseDate) / 1000);
          const totalSessionSeconds = (currentSession.minutes + 2) * 60; // Including 2 minutes for dressing/undressing
          remainingSeconds = Math.max(0, totalSessionSeconds - elapsedSeconds);
          
          setDuration(totalSessionSeconds);
          setInitialRemainingTime(remainingSeconds)
          setIsPlaying(remainingSeconds > 0);
          setTimerKey(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
  
        setWaitingClients(waitingClients.length);

        const totTime = (waitingClients.reduce((total, client) => total + (client.minutes*60) + 120, 0)) + remainingSeconds;
        setTotalWaitTime(totTime);
      } catch (error) {
        console.error('Error fetching timer data:', error);
      }
    };  

    fetchTimerData();
    const interval = setInterval(fetchTimerData, 5000); // Update every second

    return () => clearInterval(interval);
  }, [type]);

  return (
    <>
  { isPlaying > 0 &&
   <Paper elevation={3} sx={{ p: 2, borderRadius: 2, backgroundColor: 'background.paper', mb: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {type === 'lie-down' ? 'Lie-down Sunbed' : 'Stand-up Sunbed'}
      </Typography>
      <Box display="flex" justifyContent="center" alignItems="center" mb={2}>
        <CountdownCircleTimer
          key={timerKey}
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
    </Paper>}
    </>
  );
};

const SunbedTimers = () => {
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 50,
        left: 16,
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <SunbedTimer type="lie-down" />
      <SunbedTimer type="stand-up" />
    </Box>
  );
};

export default SunbedTimers;