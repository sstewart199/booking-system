// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const PrivateRoute = ({ children }) => {
    const authed = isAuthenticated() // isauth() returns true or false based on localStorage
    
    return authed ? children : <Navigate to="/login" />;
  }

export default PrivateRoute;


