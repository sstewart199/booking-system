import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, Button, Select, MenuItem, Box, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from './components/authentication/api';
import config from './config';

const API_URL = config.apiUrl;

const StaffManagementScreen = () => {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ username: '', password: '', role: 'normal' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleAddUser = async () => {
    try {
      await api.post(`${API_URL}/user`, newUser);
      setNewUser({ username: '', password: '', role: 'normal' });
      fetchUsers();
    } catch (error) {
      console.error('Failed to add user:', error);
    }
  };

  const handleResetPassword = async (id, username) => {
    const newPassword = prompt(`Enter new password for ${username}:`);
    if (newPassword) {
      try {
        await api.put(`${API_URL}/user/${id}`, { name: username, password: newPassword });
        alert('Password reset successfully');
      } catch (error) {
        console.error('Failed to reset password:', error);
      }
    }
  };

  const handleDeleteUser = async () => {
    if (userToDelete) {
      try {
        await api.delete(`${API_URL}/user/${userToDelete.id}`);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        fetchUsers();
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const openDeleteDialog = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: 'auto' }}>
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          size="small"
        />
        <TextField
          label="Password"
          type="password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          size="small"
        />
        <Select
          value={newUser.role}
          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
          size="small"
        >
          <MenuItem value="normal">Normal</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>
        <Button variant="contained" onClick={handleAddUser}>Add User</Button>
      </Box>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Username</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.username !== 'admin' && (
                    <>
                      <Button
                        size="small"
                        onClick={() => handleResetPassword(user.id, user.username)}
                      >
                        Reset Password
                      </Button>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteDialog(user)}
                        aria-label="delete"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm User Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the user "{userToDelete?.username}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteUser} autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StaffManagementScreen;