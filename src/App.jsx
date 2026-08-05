import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './admin/auth/Login';
import ForgotPassword from './admin/auth/ForgotPassword';
import AdminLayout from './admin/layout/AdminLayout';

import Dashboard from './admin/dashboard/Dashboard';
import ServicesManager from './admin/services/ServicesManager';
import AgreementsManager from './admin/agreements/AgreementsManager';
import UsersManager from './admin/users/UsersManager';
import TestimonialsManager from './admin/testimonials/TestimonialsManager';
import FAQsManager from './admin/faqs/FAQsManager';
import PricingManager from './admin/pricing/PricingManager';
import ContactRequestsManager from './admin/contact-requests/ContactRequestsManager';
import WebsiteCMS from './admin/website-content/WebsiteCMS';
import MediaManager from './admin/media/MediaManager';
import SettingsManager from './admin/settings/SettingsManager';
import AdminProfile from './admin/profile/AdminProfile';
import ActivityLogs from './admin/activity/ActivityLogs';
import { Toaster } from 'react-hot-toast';

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <Routes>
        {/* Direct redirects for bare admin routes */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Admin Authentication Routes */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/forgot-password" element={<ForgotPassword />} />

        {/* Protected Admin Dashboard Routes */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="services" element={<ServicesManager />} />
            <Route path="agreements" element={<AgreementsManager />} />
            <Route path="users" element={<UsersManager />} />
            <Route path="testimonials" element={<TestimonialsManager />} />
            <Route path="faqs" element={<FAQsManager />} />
            <Route path="pricing" element={<PricingManager />} />
            <Route path="contact-requests" element={<ContactRequestsManager />} />
            <Route path="website-content" element={<WebsiteCMS />} />
            <Route path="media" element={<MediaManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="activity-logs" element={<ActivityLogs />} />
          </Route>
        </Route>

        {/* Fallback to dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
