// utils/api.js
import api from '../components/authentication/api'; // Adjust the path as needed
import config from '../config';

const API_URL = config.apiUrl;

export const fetchClients = async () => {
    try {
        const response = await api.get(`${API_URL}/clients`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch clients:', error);
        throw error;
    }
};

export const fetchProducts = async () => {
    try {
        const response = await api.get(`${API_URL}/products`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch products:', error);
        throw error;
    }
};

export const addClient = async (newClient) => {
    try {
        const response = await api.post(`${API_URL}/addclient`, newClient);
        return response.data;
    } catch (error) {
        console.error('Failed to add client:', error);
        throw error;
    }
};

export const submitMinutes = async (clientId, minutes, sunbedType) => {
    try {
        const response = await api.post(`${API_URL}/sunbed-session`, { clientId, minutes, sunbedType });
        return response.data;
    } catch (error) {
        console.error('Failed to submit session:', error);
        throw error;
    }
};

export const makePurchase = async (clientId, items, transaction) => {
    try {
        const response = await api.post(`${API_URL}/purchases`, { clientId, items, transaction });
        return response.data;
    } catch (error) {
        console.error('Failed to confirm basket:', error);
        throw error;
    }
};

export const updateClientInfo = async (clientId, updateData) => {
    try {
        const response = await api.put(`${API_URL}/client/${clientId}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Failed to update client info:', error);
        throw error;
    }
};