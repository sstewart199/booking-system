import React, { useState, useEffect } from 'react';
import { Box, Grid, Alert, CardContent, Chip } from '@mui/material';

import { User, ShoppingBag, Clock, ShoppingCart } from "lucide-react";

import ClientSelector from './components/ClientSelector';
import AddClientModal from './components/AddClientModal';
import TabPanel from './components/TabPanel';
import TanningSession from './components/TanningSession';
import Purchases from './components/Purchases';
import ClientInfo from './components/ClientInfo';
import ClientHistory from './components/ClientHistory';
import { fetchClients, fetchProducts, addClient } from './utils/api';

const TanningSalonInterface = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [clients, setClients] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [openModal, setOpenModal] = useState(false);

    useEffect(() => {
        loadClients();
        loadProducts();
    }, []);

    const loadClients = async () => {
        try {
            const fetchedClients = await fetchClients();
            setClients(fetchedClients);
        } catch (error) {
            console.error('Failed to fetch clients:', error);
        }
    };

    const loadProducts = async () => {
        try {
            const fetchedProducts = await fetchProducts();
            setProducts(fetchedProducts);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        }
    };

    const handleAddClient = async (newClient) => {
        try {
            const addedClient = await addClient(newClient);
            await loadClients();
            setSelectedClient(addedClient?.data?.id); // Automatically select the new client
            setOpenModal(false);
        } catch (error) {
            console.error('Failed to add client:', error);
        }
    };

    const handleSelectClient = (event) => {
        setSelectedClient(event.target.value);
    };

    const handleSwitchTab = (tabIndex) => {
        setActiveTab(tabIndex);
    };

    return (
        <CardContent sx={{ p: 3 }}>
            <ClientSelector
                clients={clients}
                selectedClient={selectedClient}
                onSelectClient={handleSelectClient}
                onAddNewClient={() => setOpenModal(true)}
            />

            {selectedClient && (
                <TabPanel
                    value={activeTab}
                    onChange={setActiveTab}
                    tabs={[
                        { icon: <Clock />, label: "Tanning Session" },
                        { icon: <ShoppingBag />, label: "Purchases" },
                        { icon: <User />, label: "Client Info" },
                        { icon: <ShoppingCart />, label: "Client History" }
                    ]}
                >
                    <Grid item m={1}>
                        {(clients.find(c => c.id === selectedClient)?.remainingMinutes !== 0) && (
                            <Box sx={{ mb: 2 }}>
                                <Chip
                                    label={`Remaining Minutes: ${clients.find(c => c.id === selectedClient)?.remainingMinutes}`}
                                    color="success"
                                    variant="outlined"
                                    size="small"
                                    sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                                />
                            </Box>
                        )}
                        {(clients.find(c => c.id === selectedClient)?.remainingMinutes === 0) && (
                            <Alert severity="warning" sx={{ mt: 2 }}>
                                {clients.find(c => c.id === selectedClient)?.name} has no remaining minutes.
                            </Alert>
                        )}
                    </Grid>
                    {activeTab === 0 && (
                        <TanningSession
                            selectedClient={selectedClient}
                            clients={clients}
                            onClientsUpdate={loadClients}
                        />
                    )}
                    {activeTab === 1 && (
                        <Purchases
                            selectedClient={selectedClient}
                            products={products}
                            onClientsUpdate={loadClients}
                            onSwitchTab={handleSwitchTab}
                        />
                    )}
                    {activeTab === 2 && (
                        <ClientInfo
                            selectedClient={selectedClient}
                            clients={clients}
                            onClientsUpdate={loadClients}
                        />
                    )}
                    {activeTab === 3 && (
                        <ClientHistory selectedClient={selectedClient} />
                    )}
                </TabPanel>
            )}

            <AddClientModal
                open={openModal}
                onClose={() => setOpenModal(false)}
                onAddClient={handleAddClient}
            />
        </CardContent>
    );
};

export default TanningSalonInterface;