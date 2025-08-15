// src/hocs/WithPermission.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify';

const WithPermission = ({ children, requiredPermission }) => {
    const { hasPermission, isAuthenticated } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        // Redirect them to the login page, but save the current location they were
        // trying to go to when they were redirected. This allows us to send them
        // along to that page after they login, which is a nicer user experience.
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (!hasPermission(requiredPermission)) {
        // User is logged in but does not have the required permission.
        // Redirect to a 'Not Found' or 'Unauthorized' page.
        // For simplicity, we redirect to the dashboard home.
        toast.error("You don't have permission to access this page.");
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default WithPermission;