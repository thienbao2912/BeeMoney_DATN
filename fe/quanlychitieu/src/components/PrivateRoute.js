import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Cookies } from 'react-cookie';

const PrivateRoute = ({ element, requiredRole }) => {
    const cookies = new Cookies();
    const token = cookies.get('token');
    const userRole = cookies.get('role');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        return <Navigate to="/login" replace />;
    }

    return element;
};

export default PrivateRoute;
