// PrivateRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

const isAdminUser = (userRole) => {
  return userRole === null || userRole === "admin";
};

const AdminRoute = ({ userRole, children }) => {
    const authed = isAuthenticated() // isauth() returns true or false based on localStorage
    const isAdmin = isAdminUser(userRole);
    return (authed && isAdmin) ? children : <Navigate to="/login" />;
  }

export default AdminRoute;


