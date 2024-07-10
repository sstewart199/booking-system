// components/ClientHistory.js
import React, { useState, useEffect } from 'react';
import { Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, CircularProgress } from '@mui/material';
import { format } from 'date-fns';
import api from '../components/authentication/api';

const formatDate = (dateString) => format(new Date(dateString), 'dd/MM/yyyy HH:mm');

const deduplicatePurchases = (purchases) => {
  const uniquePurchases = {};
  purchases.forEach(purchase => {
    const key = purchase.id;
    if (!uniquePurchases[key]) {
      uniquePurchases[key] = { ...purchase, count: 1 };
    } else {
      uniquePurchases[key].count += 1;
    }
  });
  return Object.values(uniquePurchases).reverse();
};

const processMinutesUsed = (minutesUsed) => {
    const uniqueMinutesUsed = new Map(
      minutesUsed
        .filter(entry => entry.hasOwnProperty('minutes'))
        .map(entry => [entry.id, entry])
    );
  
    const sortedEntries = Array.from(uniqueMinutesUsed.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))  // Sort in chronological order
      .filter(entry => entry.minutes !== 0);
  
    let runningTotal = 0;
  
    const processedEntries = sortedEntries.map(entry => {
      const minutes = entry.minutes.toString().startsWith('+')
        ? parseInt(entry.minutes)
        : -Math.abs(parseInt(entry.minutes));
    
        if(entry.remainingMinutes){
            runningTotal = entry.remainingMinutes;
        } else {
            runningTotal += minutes;
        }
  
      return {
        date: entry.date,
        minutes: minutes > 0 ? `Purchased ${minutes} minutes` : `Used ${minutes} minutes`,
        remainingMinutes: runningTotal,
      };
    });
  
    // Reverse the array to get the desired order (most recent first)
    return processedEntries.reverse();
  };

const ClientHistory = ({ selectedClient }) => {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientHistory = async () => {
      try {
        const response = await api.get(`/customer-history/${selectedClient}`);
        setClient(response?.data[0]);
      } catch (error) {
        console.error('Failed to fetch client history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientHistory();
  }, [selectedClient]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!client) {
    return <Typography>No client data found.</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>{client.name}'s History</Typography>
      <Typography variant="body2" gutterBottom>Phone: {client.phone}</Typography>
      <Typography variant="body2" gutterBottom>Address: {client.address}</Typography>
      <Typography variant="body2" gutterBottom>Current Remaining Minutes: {client.remainingMinutes}</Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Purchases</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Item</TableCell>
              <TableCell align="right">Price</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deduplicatePurchases(client.purchases).map((purchase, index) => (
              <TableRow key={index}>
                <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
                <TableCell>{purchase.item}</TableCell>
                <TableCell align="right">£{purchase.price.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>Minutes Used</Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell align="right">Minutes Used</TableCell>
              <TableCell align="right">Remaining Minutes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processMinutesUsed(client.minutesUsed).map((usage, index) => (
             <TableRow key={index}>
                <TableCell>{formatDate(usage.date)}</TableCell>
                <TableCell align="right">{usage.minutes}</TableCell>
                <TableCell align="right">{usage.remainingMinutes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ClientHistory;