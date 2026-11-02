import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, openAuthModal } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      openAuthModal('login');
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '32px', color: '#2874f0' }}></i>
        <p style={{ marginTop: '12px', color: '#666' }}>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
        <h2>Access Denied</h2>
        <p style={{ color: '#e74c3c', marginTop: '10px' }}>
          Administrator privileges are required to view this page.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
