import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  IconButton
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DeleteIcon from '@mui/icons-material/Delete';
import api from './components/authentication/api';
import config from './config';

const API_URL = config.apiUrl;

const ProductsManagementScreen = () => {
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({ name: '', price: '' });
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState({ open: false, productId: null });
  const [errors, setErrors] = useState({ name: '', price: '' });


  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get(`${API_URL}/products`);
      sortProducts(response.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  const sortProducts = (productList) => {
    const numericProducts = productList.filter(p => /^\d+$/.test(p.name)).sort((a, b) => parseInt(a.name) - parseInt(b.name));
    const regularProducts = productList.filter(p => !/^\d+$/.test(p.name)).sort((a, b) => a.order - b.order);
    setProducts([...numericProducts, ...regularProducts]);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setIsNewProduct(false);
    } else {
      setCurrentProduct({ name: '', price: '' });
      setIsNewProduct(true);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateInputs = () => {
    let isValid = true;
    const newErrors = { name: '', price: '' };

    if (!currentProduct.name.trim()) {
      newErrors.name = 'Product name is required';
      isValid = false;
    }

    const price = parseFloat(currentProduct.price);
    if (isNaN(price) || price < 0.01 || price > 500 || !/^\d+(\.\d{1,2})?$/.test(currentProduct.price)) {
      newErrors.price = 'Price must be between £0.01 and £500.00 with up to 2 decimal places';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSaveProduct = async () => {
    if (!validateInputs()) return;

    try {
      if (isNewProduct) {
        await api.post(`${API_URL}/products`, currentProduct);
      } else {
        await api.put(`${API_URL}/products/${currentProduct.id}`, currentProduct);
      }
      fetchProducts();
      handleCloseDialog();
      showSnackbar('Product saved successfully', 'success');
    } catch (error) {
      console.error('Failed to save product:', error);
      showSnackbar('Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await api.delete(`${API_URL}/products/${id}`);
      fetchProducts();
      showSnackbar('Product deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showSnackbar('Failed to delete product', 'error');
    }
  };

  const moveProduct = async (index, direction) => {
    const nonNumericProducts = products.filter(p => !/^\d+$/.test(p.name));
    const nonNumericIndex = nonNumericProducts.findIndex(p => p.id === products[index].id);

    if (nonNumericIndex === -1) return; // Don't move numeric products

    const newIndex = direction === 'up' ? nonNumericIndex - 1 : nonNumericIndex + 1;
    if (newIndex < 0 || newIndex >= nonNumericProducts.length) return;

    const newProducts = [...nonNumericProducts];
    [newProducts[nonNumericIndex], newProducts[newIndex]] = [newProducts[newIndex], newProducts[nonNumericIndex]];

    try {
      await updateProductOrder(newProducts);
      showSnackbar('Product order updated successfully', 'success');
      fetchProducts();
    } catch (error) {
      console.error('Failed to update product order:', error);
      showSnackbar('Failed to update product order', 'error');
    }
  };

  const updateProductOrder = async (items) => {
    const updatedOrder = items.map((item, index) => ({
      id: item.id,
      order: index
    }));

    await api.put(`${API_URL}/products/reorder`, { products: updatedOrder });
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const formatProductName = (product) => {
    return /^\d+$/.test(product.name) ? `${product.name} Minutes` : product.name;
  };

  const formatPrice = (price) => {
    return `£${parseFloat(price).toFixed(2)}`;
  };

  const handleDeleteConfirm = (id) => {
    setDeleteConfirmDialog({ open: true, productId: id });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmDialog({ open: false, productId: null });
  };

  const handleDeleteConfirmed = async () => {
    try {
      await api.delete(`${API_URL}/products/${deleteConfirmDialog.productId}`);
      fetchProducts();
      showSnackbar('Product deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete product:', error);
      showSnackbar('Failed to delete product', 'error');
    } finally {
      setDeleteConfirmDialog({ open: false, productId: null });
    }
  };

  return (
    <CardContent sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" color="primary" onClick={() => handleOpenDialog()}>
          Add New Product
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="center">Actions</TableCell>
              <TableCell align="center">Move</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product, index) => (
              <TableRow key={product.id}>
                <TableCell component="th" scope="row">{formatProductName(product)}</TableCell>
                <TableCell align="right">{formatPrice(product.price)}</TableCell>
                <TableCell align="center">
                  <Button onClick={() => handleOpenDialog(product)}>Edit</Button>
                  {!/^\d+$/.test(product.name) && (
                    <IconButton onClick={() => handleDeleteConfirm(product.id)} size="small">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </TableCell>
                <TableCell align="center">
                  {!/^\d+$/.test(product.name) && (
                    <>
                      <IconButton
                        onClick={() => moveProduct(index, 'up')}
                        disabled={index === products.filter(p => /^\d+$/.test(p.name)).length}
                        size="small"
                      >
                        <ArrowUpwardIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => moveProduct(index, 'down')}
                        disabled={index === products.length - 1}
                        size="small"
                      >
                        <ArrowDownwardIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>{isNewProduct ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Product Name"
            type="text"
            fullWidth
            value={currentProduct.name}
            onChange={handleInputChange}
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            margin="dense"
            name="price"
            label="Price"
            type="number"
            fullWidth
            value={currentProduct.price}
            onChange={handleInputChange}
            error={!!errors.price}
            helperText={errors.price}
            inputProps={{
              step: 0.01,
              min: 0.01,
              max: 500,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSaveProduct}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteConfirmDialog.open} onClose={handleDeleteCancel}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this product?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirmed} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </CardContent>
  );
};

export default ProductsManagementScreen;
