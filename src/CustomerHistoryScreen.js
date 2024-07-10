import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Accordion, AccordionSummary, AccordionDetails, CircularProgress, TextField,
  IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DeleteIcon from '@mui/icons-material/Delete';
import { format } from 'date-fns';
import api from './components/authentication/api';

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

const CustomerHistoryScreen = ({ userRole }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);

  useEffect(() => {
    const fetchCustomerHistory = async () => {
      try {
        const response = await api.get('/customer-history');
        setCustomers(response.data);
      } catch (error) {
        console.error('Failed to fetch customer history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerHistory();
  }, []);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        await api.delete(`/client/${customerToDelete.id}`);
        setCustomers(customers.filter(c => c.id !== customerToDelete.id));
      } catch (error) {
        console.error('Failed to delete customer:', error);
        // You might want to show an error message to the user here
      }
    }
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCustomerToDelete(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Customer History</Typography>
      <TextField
        fullWidth
        label="Search Customers"
        variant="outlined"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 2 }}
      />
      {filteredCustomers.map((customer) => (
        <CustomerAccordion 
          key={customer.id} 
          customer={customer} 
          userRole={userRole}
          onDeleteClick={handleDeleteClick}
        />
      ))}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        customerName={customerToDelete?.name}
      />
    </Box>
  );
};

const CustomerAccordion = ({ customer, userRole, onDeleteClick }) => (
  <Accordion sx={{ mb: 2 }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
      <Typography>{customer.name}</Typography>
    </AccordionSummary>
    <AccordionDetails>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <CustomerDetails customer={customer} />
        {userRole === "admin" && (
          <IconButton 
            edge="end" 
            aria-label="delete" 
            onClick={() => onDeleteClick(customer)}
            sx={{ ml: 2 }}
          >
            <DeleteIcon color="error" />
          </IconButton>
        )}
      </Box>
      <PurchasesTable purchases={customer.purchases} />
      <MinutesUsedTable minutesUsed={customer.minutesUsed} />
    </AccordionDetails>
  </Accordion>
);

const DeleteConfirmationDialog = ({ open, onClose, onConfirm, customerName }) => (
  <Dialog
    open={open}
    onClose={onClose}
    aria-labelledby="alert-dialog-title"
    aria-describedby="alert-dialog-description"
  >
    <DialogTitle id="alert-dialog-title">{"Delete Customer"}</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-description">
        Are you certain you want to delete the customer "{customerName}"? This action cannot be reverted.
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} color="primary">
        Cancel
      </Button>
      <Button 
        onClick={onConfirm} 
        color="error" 
        variant="contained" 
        autoFocus
        sx={{ 
          backgroundColor: 'red',
          '&:hover': {
            backgroundColor: 'darkred',
          }
        }}
      >
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

const CustomerDetails = ({ customer }) => (
  <Box>
    <Typography variant="body2" gutterBottom>Phone: {customer.phone}</Typography>
    <Typography variant="body2" gutterBottom>Address: {customer.address}</Typography>
    <Typography variant="body2" gutterBottom>Current Remaining Minutes: {customer.remainingMinutes}</Typography>
  </Box>
);

const PurchasesTable = ({ purchases }) => (
  <>
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
          {deduplicatePurchases(purchases).map((purchase, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(purchase.purchaseDate)}</TableCell>
              <TableCell>{purchase.item}</TableCell>
              <TableCell align="right">£{purchase.price.toFixed(2)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

const MinutesUsedTable = ({ minutesUsed }) => (
  <>
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
          {processMinutesUsed(minutesUsed).map((usage, index) => (
            <TableRow key={index}>
              <TableCell>{formatDate(usage.date)}</TableCell>
              <TableCell align="right">{usage.minutes}</TableCell>
              <TableCell align="right">{usage.remainingMinutes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  </>
);

export default CustomerHistoryScreen;