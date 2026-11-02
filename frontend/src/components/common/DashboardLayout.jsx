import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ allowedRoles = [] }) => {
  const { user, role, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-main)',
          color: 'var(--primary-green)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-indicator" style={{ width: '24px', height: '24px', marginBottom: '16px' }} />
          <div>Loading EV Hub Portal...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the user's appropriate portal
    if (role === 'ADMIN') return <Navigate to="/admin" replace />;
    if (role === 'OWNER') return <Navigate to="/owner" replace />;
    return <Navigate to="/user" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main
          style={{
            flex: 1,
            padding: '32px 36px',
            maxWidth: '1360px',
            margin: '0 auto',
            width: '100%',
            overflowY: 'auto',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

