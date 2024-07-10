import React, { useState, useEffect } from 'react';
import { Typography, TextField, Button, Box, Alert, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { updateClientInfo } from '../utils/api';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
}));

const ClientInfo = ({ selectedClient, clients, onClientsUpdate }) => {
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [clientDob, setClientDob] = useState(null);
    const [alert, setAlert] = useState(null);

    useEffect(() => {
        const client = clients.find(c => c.id === selectedClient);
        if (client) {
            setClientName(client.name || '');
            setClientPhone(client.phone || '');
            setClientAddress(client.address || '');
            setClientDob(client.dob ? dayjs(client.dob, 'DD/MM/YYYY') : null);
        }
    }, [selectedClient, clients]);

    const handleUpdateClientInfo = async () => {
        try {
            await updateClientInfo(selectedClient, {
                name: clientName,
                phone: clientPhone,
                address: clientAddress,
                dob: clientDob ? clientDob.format('DD/MM/YYYY') : null
            });
            onClientsUpdate();
            setAlert({ severity: 'success', message: 'Client info updated successfully.' });
        } catch (error) {
            console.error('Failed to update client info:', error);
            setAlert({ severity: 'error', message: 'Failed to update client info.' });
        }
    };

    return (
        <StyledPaper elevation={3}>
            <Box>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Client Information: {clients.find(c => c.id === selectedClient)?.name}
                </Typography>
                <TextField
                    fullWidth
                    label="Name"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Phone Number"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <TextField
                    fullWidth
                    label="Address"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    sx={{ mb: 2 }}
                />
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Date of Birth"
                        value={clientDob}
                        onChange={(newDate) => setClientDob(newDate)}
                        format="DD/MM/YYYY"
                        sx={{ width: '100%', mb: 2 }}
                        slotProps={{
                            textField: {
                                fullWidth: true,
                            }
                        }}
                    />
                </LocalizationProvider>
                <Button variant="contained" color="primary" onClick={handleUpdateClientInfo}>
                    Update Client Info
                </Button>
                {alert && (
                    <Alert severity={alert.severity} sx={{ mt: 2 }}>
                        {alert.message}
                    </Alert>
                )}
            </Box>
        </StyledPaper>
    );
};

export default ClientInfo;