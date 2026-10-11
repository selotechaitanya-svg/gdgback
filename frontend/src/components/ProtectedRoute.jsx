import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-static" style={{ padding: '2rem', textAlign: 'center' }}>
          <div className="font-pixel" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
            VERIFYING_AUTH...<span className="cursor-blink">█</span>
          </div>
          <p className="font-mono" style={{ fontSize: '0.875rem', color: '#52525B' }}>
            Checking credentials with server
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
