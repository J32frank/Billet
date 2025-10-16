import React from "react";
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

function ProtectedRoute({ children, requiredRole = []}){ 
    const { user, loading} = useAuth();
    const location = useLocation();
    
    if(loading){
        return <LoadingSpinner />
    }

    if(!user) {
        return <Navigate to="/login" state={{ from: location}} replace />
    }

    if(requiredRole.length > 0){
        const hasRequiredRole = requiredRole.includes(user.role);
        if(!hasRequiredRole){
            return <Navigate to="/login" replace />
        }
    }

    return children;
}

export default ProtectedRoute;