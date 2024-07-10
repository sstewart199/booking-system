import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme
} from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import dayjs from 'dayjs';
import api from './components/authentication/api';
import config from './config';

const API_URL = config.apiUrl;

const SalesScreen = ({ userRole }) => {
  const [salesData, setSalesData] = useState({ transactions: [], dailyTotals: {} });
  const [currentDate, setCurrentDate] = useState(dayjs());
  const theme = useTheme();
  const [filter, setFilter] = useState({
    paymentMethod: 'all',
    transactionType: 'sale'
  });

  useEffect(() => {
    fetchSales(getFormattedDate(currentDate));
  }, [currentDate]);

  const fetchSales = async (suppliedDate) => {
    try {
      const response = await api.get(`${API_URL}/transactions`, {
        params: { date: suppliedDate }
      });
      const sortedTransactions = response.data.transactions.sort((a, b) =>
        new Date(b.date) - new Date(a.date)
      );
      setSalesData({ ...response.data, transactions: sortedTransactions });
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setSalesData({ transactions: [], dailyTotals: {} });
    }
  };

  const getFormattedDate = (date) => {
    return date.format('YYYY-MM-DD');
  };

  const handleDateChange = (newDate) => {
    setCurrentDate(newDate);
  };

  const handlePreviousDay = useCallback(() => {
    setCurrentDate(prev => prev.subtract(1, 'day'));
  }, []);

  const handleNextDay = useCallback(() => {
    setCurrentDate(prev => prev.add(1, 'day'));
  }, []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'ArrowLeft') {
      handlePreviousDay();
    } else if (event.key === 'ArrowRight') {
      handleNextDay();
    }
  }, [handlePreviousDay, handleNextDay]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleFilterChange = (filterType, value) => {
    setFilter(prevFilter => ({
      ...prevFilter,
      [filterType]: value
    }));
  };

  const filteredTransactions = salesData.transactions.filter(transaction => {
    const paymentMethodMatch =
      filter.paymentMethod === 'all' ||
      (filter.paymentMethod === 'cash' && transaction.payments?.cash > 0) ||
      (filter.paymentMethod === 'card' && transaction.payments?.card > 0);

    const transactionTypeMatch =
      filter.transactionType === 'all' ||
      (filter.transactionType === 'sale' && !transaction.isMinutesUsage) ||
      (filter.transactionType === 'minutes' && transaction.isMinutesUsage);

    return paymentMethodMatch && transactionTypeMatch;
  });

  const safelyFormatNumber = (value) => {
    return (typeof value === 'number' && value !== 0) ? value.toFixed(2) : '-';
  };

  const formatDateTime = (dateString) => {
    return dayjs(dateString).format('HH:mm:ss');
  };

  const highlightStyle = {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.background.paper
  };


  return (
    <React.Fragment>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <IconButton onClick={handlePreviousDay} aria-label="Previous day">
            <ArrowBackIosNewIcon />
          </IconButton>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select a date"
              value={currentDate}
              format="DD/MM/YYYY"
              onChange={handleDateChange}
              renderInput={(params) => <TextField {...params} />}
            />
          </LocalizationProvider>
          <IconButton onClick={handleNextDay} aria-label="Next day">
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
          <ToggleButtonGroup
            value={filter.paymentMethod}
            exclusive
            onChange={(event, newValue) => handleFilterChange('paymentMethod', newValue || 'all')}
            aria-label="payment method filter"
          >
            <ToggleButton value="all" aria-label="all payments">
              All
            </ToggleButton>
            <ToggleButton value="cash" aria-label="cash only">
              Cash
            </ToggleButton>
            <ToggleButton value="card" aria-label="card only">
              Card
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={filter.transactionType}
            exclusive
            onChange={(event, newValue) => handleFilterChange('transactionType', newValue || 'sale')}
            aria-label="transaction type filter"
          >
            <ToggleButton value="sale" aria-label="sales only">
              Sale
            </ToggleButton>
            <ToggleButton value="minutes" aria-label="minutes usage only">
              Minutes Usage
            </ToggleButton>
            <ToggleButton value="all" aria-label="all types">
              All
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Client Name</TableCell>
                <TableCell>Purchase Items</TableCell>
                <TableCell align="right">Total (£)</TableCell>
                <TableCell align="right">Cash (£)</TableCell>
                <TableCell align="right">Card (£)</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{formatDateTime(transaction.date)}</TableCell>
                  <TableCell component="th" scope="row">
                    {transaction.clientName.endsWith('(Removed)') ? (
                      <>
                        {transaction.clientName.slice(0, -9)}
                        <span style={{ color: 'red' }}>(Removed)</span>
                      </>
                    ) : (
                      transaction.clientName
                    )}
                  </TableCell>
                  <TableCell>
                    <ul style={{ margin: 0, paddingInlineStart: '20px' }}>
                      {transaction.purchaseItems && transaction.purchaseItems.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell align="right">{safelyFormatNumber(transaction.totalAmount)}</TableCell>
                  <TableCell align="right">{safelyFormatNumber(transaction.payments?.cash)}</TableCell>
                  <TableCell align="right">{safelyFormatNumber(transaction.payments?.card)}</TableCell>
                  <TableCell>{transaction.isMinutesUsage ? 'Minutes Usage' : 'Sale'}</TableCell>
                </TableRow>
              ))}

              {userRole === "admin" && salesData.dailyTotals && (
                <TableRow>
                  <TableCell colSpan={3}><strong>Daily Totals</strong></TableCell>
                  <TableCell align="right"><strong>£{safelyFormatNumber(salesData.dailyTotals.total)}</strong></TableCell>
                  <TableCell
                    align="right"
                    sx={filter.paymentMethod === 'cash' ? highlightStyle : {}}
                  >
                    <strong>£{safelyFormatNumber(salesData.dailyTotals.cash)}</strong>
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={filter.paymentMethod === 'card' ? highlightStyle : {}}
                  >
                    <strong>£{safelyFormatNumber(salesData.dailyTotals.card)}</strong>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </React.Fragment>
  );
};

export default SalesScreen;