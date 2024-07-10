// components/Purchases.js
import React, { useState, useEffect } from 'react';
import { Typography, Button, Grid, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Divider, Alert, Box, Paper, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { makePurchase } from '../utils/api';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const ProductCategory = ({ title, products, onAddToBasket }) => (
  <Box sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
    <Grid container spacing={1}>
      {products.map(product => (
        <Grid item xs={6} sm={4} md={3} lg={2} key={product.id}>
          <Button
            fullWidth
            variant={!isNaN(product.name) ? "outlined" : "contained"}
            color="primary"
            onClick={() => onAddToBasket(product)}
            sx={{ height: '100%' }}
          >
            {!isNaN(product.name) ? `${product.name} min` : product.name}
            <br />
            £{product.price.toFixed(2)}
          </Button>
        </Grid>
      ))}
    </Grid>
  </Box>
);

const Purchases = ({ selectedClient, products, onClientsUpdate, onSwitchTab }) => {
    const [basket, setBasket] = useState([]);
    const [alert, setAlert] = useState(null);
    const [tabValue, setTabValue] = useState(0);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [cashAmount, setCashAmount] = useState('');
    const [cardAmount, setCardAmount] = useState('');
    const [amountError, setAmountError] = useState('');

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAddToBasket = (item) => {
    const itemName = !isNaN(item.name) ? `${item.name} minutes` : item.name;
    const updatedItem = { ...item, name: itemName };
    setAlert({ severity: 'success', message: `${updatedItem.name} added to basket.` });
    setBasket(prev => [...prev, updatedItem]);
  };

  const handleRemoveFromBasket = (index) => {
    setBasket(prevBasket => {
      const removedItem = prevBasket[index];
      const newBasket = prevBasket.filter((_, i) => i !== index);
      setAlert({ severity: 'error', message: `${removedItem.name} removed from basket` });
      return newBasket;
    });
  };

  const calculateTotal = () => {
    return basket.reduce((total, item) => total + item.price, 0);
  };

  useEffect(() => {
    if (paymentMethod === 'both') {
      const total = calculateTotal();
      const cashAmountNum = parseFloat(cashAmount) || 0;
      const cardAmountNum = parseFloat(cardAmount) || 0;
      const sum = cashAmountNum + cardAmountNum;

      if (sum !== total) {
        setAmountError(`Total must equal £${total.toFixed(2)}. Current total: £${sum.toFixed(2)}`);
      } else {
        setAmountError('');
      }
    } else {
      setAmountError('');
    }
  }, [paymentMethod, cashAmount, cardAmount]);

  const handleConfirmBasket = () => {
    if (basket.length > 0) {
      setConfirmDialogOpen(true);
    } else {
      setAlert({ severity: 'error', message: 'Basket is empty.' });
    }
  };

  const handlePaymentMethodChange = (event) => {
    setPaymentMethod(event.target.value);
    if (event.target.value !== 'both') {
      setCashAmount('');
      setCardAmount('');
    }
  };

  const handleConfirmPurchase = async () => {
    const total = calculateTotal();
    let transaction;

    if (paymentMethod === 'cash') {
      transaction = [{ transactionId: 1, amount: total }];
    } else if (paymentMethod === 'card') {
      transaction = [{ transactionId: 2, amount: total }];
    } else {
      const cashAmountNum = parseFloat(cashAmount);
      const cardAmountNum = parseFloat(cardAmount);
      transaction = [
        { transactionId: 1, amount: cashAmountNum },
        { transactionId: 2, amount: cardAmountNum }
      ];
    }

    try {
      await makePurchase(selectedClient, basket, transaction);
      setBasket([]);
      onClientsUpdate();
      setConfirmDialogOpen(false);
      
      const minutesPurchased = basket.some(item => item.name.endsWith('minutes'));
      if (minutesPurchased) {
        setAlert({ severity: 'warning', message: `Please ensure you remove today's sunbed minutes for the client` });
      } else {
        setAlert({ severity: 'success', message: 'Purchase completed successfully.' });
      }
    } catch (error) {
      console.error('Failed to confirm basket:', error);
      setAlert({ severity: 'error', message: 'Failed to confirm basket.' });
    }
  };
  

  const minuteProducts = products.filter(product => !isNaN(product.name));
  const otherProducts = products.filter(product => isNaN(product.name));

  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" sx={{ mb: 3 }}>Purchases and Minutes</Typography>
      
      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
        <Tab label="Sunbed Minutes" />
        <Tab label="Other Products" />
      </Tabs>

      {tabValue === 0 && (
        <ProductCategory
          title="Sunbed Minutes"
          products={minuteProducts}
          onAddToBasket={handleAddToBasket}
        />
      )}

      {tabValue === 1 && (
        <ProductCategory
          title="Other Products"
          products={otherProducts}
          onAddToBasket={handleAddToBasket}
        />
      )}

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>Basket</Typography>
      <List>
        {basket.map((item, index) => (
          <ListItem key={index}>
            <ListItemText
              primary={item.name}
              secondary={`£${item.price.toFixed(2)}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => handleRemoveFromBasket(index)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        color="primary"
        onClick={handleConfirmBasket}
        sx={{ mt: 2 }}
        fullWidth
      >
        Confirm Basket (Total: £{calculateTotal().toFixed(2)})
      </Button>

      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Purchase</DialogTitle>
        <DialogContent>
          <Typography variant="h6" sx={{ mb: 2 }}>Total: £{calculateTotal().toFixed(2)}</Typography>
          <RadioGroup
            value={paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            <FormControlLabel value="cash" control={<Radio />} label="Cash" />
            <FormControlLabel value="card" control={<Radio />} label="Card" />
            <FormControlLabel value="both" control={<Radio />} label="Both" />
          </RadioGroup>
          {paymentMethod === 'both' && (
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Cash Amount"
                type="number"
                value={cashAmount}
                onChange={(e) => setCashAmount(e.target.value)}
                fullWidth
                sx={{ mb: 2 }}
              />
              <TextField
                label="Card Amount"
                type="number"
                value={cardAmount}
                onChange={(e) => setCardAmount(e.target.value)}
                fullWidth
              />
              {amountError && (
                <Typography color="error" sx={{ mt: 1 }}>
                  {amountError}
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmPurchase} 
            variant="contained" 
            color="primary"
            disabled={!paymentMethod || (paymentMethod === 'both' && amountError !== '')}
          >
            Confirm Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {alert && (
        <Alert severity={alert.severity} sx={{ mt: 2 }}>
          {alert.message}
        </Alert>
      )}
    </StyledPaper>
  );
};

export default Purchases;