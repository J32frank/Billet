import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import MobileLoginDemo from './components/ui/login';
import AdminDashboard from './pages/AdminDashboard';
import CreateEventPage from './pages/createEvent';
import EventsListPage from './pages/listEvent';
import MobileBottomMenu from './components/ui/menu';
import SellerDashboard from './components/sellers/dashboard';
import SellerStatsPage from './pages/SellerStatsPage';
import SellerAllTicketsPage from './pages/SellerAllTicketsPage';
import SellerProfilePage from './pages/SellerProfilePage';
import AdminStatsPage from './pages/AdminStatsPage';
import PublicTicketDownload from './pages/PublicTicketDownload';
import EventDetailPage from './pages/EventDetailPage';

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Admin Route Component
function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return isAdmin ? children : <Navigate to="/login" replace />;
}

// Seller Route Component
function SellerRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: 'rgb(12, 12, 12)' }}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return (isAuthenticated && user?.role === 'seller') ? children : <Navigate to="/login" replace />;
}

export default function AppRouter() {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <ErrorBoundary>
      <Routes>
      <Route 
        path="/login" 
        element={
          isAuthenticated ? (
            user?.role === 'admin' ? <Navigate to="/admin/events" replace /> : <Navigate to="/seller" replace />
          ) : <MobileLoginDemo />
        } 
      />
      
      <Route 
        path="/admin/dashboard" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/create-event" 
        element={
          <AdminRoute>
            <CreateEventPage />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/events" 
        element={
          <AdminRoute>
            <EventsListPage />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/stats" 
        element={
          <AdminRoute>
            <AdminStatsPage />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/admin/events/:eventId" 
        element={
          <AdminRoute>
            <EventDetailPage />
          </AdminRoute>
        } 
      />
      
      <Route 
        path="/seller" 
        element={
          <SellerRoute>
            <SellerDashboard />
          </SellerRoute>
        } 
      />
      
      <Route 
        path="/seller/stats" 
        element={
          <SellerRoute>
            <SellerStatsPage />
          </SellerRoute>
        } 
      />
      
      <Route 
        path="/seller/all-tickets" 
        element={
          <SellerRoute>
            <SellerAllTicketsPage />
          </SellerRoute>
        } 
      />
      
      <Route 
        path="/seller/profile" 
        element={
          <SellerRoute>
            <SellerProfilePage />
          </SellerRoute>
        } 
      />
      
      <Route 
        path="/menu" 
        element={
          <ProtectedRoute>
            <MobileBottomMenu />
          </ProtectedRoute>
        } 
      />
      
      {/* Public ticket download route - no authentication required */}
      <Route 
        path="/ticket/:ticketId/:token" 
        element={<PublicTicketDownload />} 
      />
      
      <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  );
}