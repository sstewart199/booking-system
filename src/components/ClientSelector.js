import React from 'react';
import { Grid, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material';

const ClientSelector = ({ clients, selectedClient, onSelectClient, onAddNewClient }) => (
    <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={8}>
            <FormControl fullWidth>
                <InputLabel>Select a client</InputLabel>
                <Select value={selectedClient} onChange={onSelectClient}>
                    {clients.map(client => (
                        <MenuItem key={client.id} value={client.id}>{client.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={4}>
            <Button variant="contained" color="success" onClick={onAddNewClient} fullWidth>
                Add New Client
            </Button>
        </Grid>
    </Grid>
);

export default ClientSelector;