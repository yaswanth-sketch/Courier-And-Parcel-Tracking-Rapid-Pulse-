import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false, carrierOnly = false }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (adminOnly && user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  if (carrierOnly && user.role !== 'carrier') return <Navigate to="/dashboard" replace />;
  
  return children;
};

export const PublicRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user) {
    const target = user.role === 'admin' ? '/admin' : user.role === 'carrier' ? '/carrier' : '/dashboard';
    return <Navigate to={target} replace />;
  }
  
  return children;
};
