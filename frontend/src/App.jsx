import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import DashboardLayout from './components/common/DashboardLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import ExplorePage from './pages/public/ExplorePage';
import StationDetailsPage from './pages/public/StationDetailsPage';
import PricingPage from './pages/public/PricingPage';
import HowItWorksPage from './pages/public/HowItWorksPage';
import AboutPage from './pages/public/AboutPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterUserPage from './pages/auth/RegisterUserPage';
import RegisterOwnerPage from './pages/auth/RegisterOwnerPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// User Dashboard Pages
import UserOverview from './pages/user/UserOverview';
import UserBookings from './pages/user/UserBookings';
import UserFavorites from './pages/user/UserFavorites';
import UserProfile from './pages/user/UserProfile';
import UserSupport from './pages/user/UserSupport';

// Owner Dashboard Pages
import OwnerOverview from './pages/owner/OwnerOverview';
import OwnerStations from './pages/owner/OwnerStations';
import RegisterStation from './pages/owner/RegisterStation';
import AvailabilityCalendar from './pages/owner/AvailabilityCalendar';
import OwnerBookings from './pages/owner/OwnerBookings';
import OwnerEarnings from './pages/owner/OwnerEarnings';
import OwnerSubscriptions from './pages/owner/OwnerSubscriptions';
import OwnerReviews from './pages/owner/OwnerReviews';
import OwnerProfile from './pages/owner/OwnerProfile';

// Admin Dashboard Pages
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOwners from './pages/admin/AdminOwners';
import AdminStations from './pages/admin/AdminStations';
import AdminBookings from './pages/admin/AdminBookings';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';
import AdminFinancials from './pages/admin/AdminFinancials';
import AdminReports from './pages/admin/AdminReports';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminSettings from './pages/admin/AdminSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <NotificationProvider>
            {/* Global Dark Toast Notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#171E1A',
                  color: '#F2F5F2',
                  border: '1px solid #243028',
                  borderRadius: '10px',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
                },
                success: {
                  iconTheme: {
                    primary: '#39F28A',
                    secondary: '#090B0A',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#FF7272',
                    secondary: '#090B0A',
                  },
                },
              }}
            />

            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/station/:id" element={<StationDetailsPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/how-it-works" element={<HowItWorksPage />} />
              <Route path="/about" element={<AboutPage />} />

              {/* Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterUserPage />} />
              <Route path="/register-owner" element={<RegisterOwnerPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* Protected User Portal */}
              <Route path="/user" element={<DashboardLayout allowedRoles={['USER', 'ADMIN']} />}>
                <Route index element={<UserOverview />} />
                <Route path="bookings" element={<UserBookings />} />
                <Route path="favorites" element={<UserFavorites />} />
                <Route path="profile" element={<UserProfile />} />
                <Route path="support" element={<UserSupport />} />
              </Route>

              {/* Protected Owner / Host Portal */}
              <Route path="/owner" element={<DashboardLayout allowedRoles={['OWNER', 'ADMIN']} />}>
                <Route index element={<OwnerOverview />} />
                <Route path="stations" element={<OwnerStations />} />
                <Route path="stations/new" element={<RegisterStation />} />
                <Route path="calendar" element={<AvailabilityCalendar />} />
                <Route path="bookings" element={<OwnerBookings />} />
                <Route path="earnings" element={<OwnerEarnings />} />
                <Route path="subscriptions" element={<OwnerSubscriptions />} />
                <Route path="reviews" element={<OwnerReviews />} />
                <Route path="profile" element={<OwnerProfile />} />
              </Route>

              {/* Protected Admin Portal */}
              <Route path="/admin" element={<DashboardLayout allowedRoles={['ADMIN']} />}>
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="owners" element={<AdminOwners />} />
                <Route path="stations" element={<AdminStations />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="subscriptions" element={<AdminSubscriptions />} />
                <Route path="financials" element={<AdminFinancials />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="audit-logs" element={<AdminAuditLogs />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </NotificationProvider>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

