import axios from 'axios';
import configfile from '../../config';

const api = axios.create({
  baseURL: configfile.apiUrl, // Replace with your base URL
  withCredentials: true
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      localStorage.setItem('token', newToken);
    }
    return response;
  },
  error => {
    if (error.response && error.response.status === 401) {
      // Redirect to login
      localStorage.removeItem('token'); // Remove the token from localStorage
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;