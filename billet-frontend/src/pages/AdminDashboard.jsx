import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MobileBottomMenu from '../components/ui/menu';

export default function AdminDashboard() {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if not authenticated or not admin
  React.useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, isAdmin, navigate]);

  // Show the main admin interface with menu
  return <MobileBottomMenu />;
}