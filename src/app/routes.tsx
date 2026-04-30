import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';

// Farmer Pages
import FarmerDashboard     from './pages/farmer/FarmerDashboard';
import FarmerFields        from './pages/farmer/FarmerFields';
import FarmerFinancials    from './pages/farmer/FarmerFinancials';
import FarmerTasks         from './pages/farmer/FarmerTasks';
import FarmerWeather       from './pages/farmer/FarmerWeather';
import FarmerRecommendations from './pages/farmer/FarmerRecommendations';
import FarmerReports       from './pages/farmer/FarmerReports';

// Agronomist Pages
import AgronomistDashboard      from './pages/agronomist/AgronomistDashboard';
import AgronomistFarmers        from './pages/agronomist/AgronomistFarmers';
import AgronomistFields         from './pages/agronomist/AgronomistFields';
import AgronomistRecommendations from './pages/agronomist/AgronomistRecommendations';
import AgronomistCropLibrary    from './pages/agronomist/AgronomistCropLibrary';
import AgronomistAnalytics      from './pages/agronomist/AgronomistAnalytics';
import AgronomistReports        from './pages/agronomist/AgronomistReports';

// Admin Pages
import AdminDashboard      from './pages/admin/AdminDashboard';
import AdminUsers          from './pages/admin/AdminUsers';
import AdminCrops          from './pages/admin/AdminCrops';
import AdminAnalytics      from './pages/admin/AdminAnalytics';
import AdminNotifications  from './pages/admin/AdminNotifications';
import AdminSettings       from './pages/admin/AdminSettings';

export const router = createBrowserRouter([
  { path: '/', Component: LoginPage },

  // Farmer
  { path: '/farmer',              element: <Navigate to="/farmer/dashboard" replace /> },
  { path: '/farmer/dashboard',    element: <Layout><FarmerDashboard /></Layout> },
  { path: '/farmer/fields',       element: <Layout><FarmerFields /></Layout> },
  { path: '/farmer/financials',   element: <Layout><FarmerFinancials /></Layout> },
  { path: '/farmer/tasks',        element: <Layout><FarmerTasks /></Layout> },
  { path: '/farmer/weather',      element: <Layout><FarmerWeather /></Layout> },
  { path: '/farmer/recommendations', element: <Layout><FarmerRecommendations /></Layout> },
  { path: '/farmer/reports',      element: <Layout><FarmerReports /></Layout> },

  // Agronomist
  { path: '/agronomist',          element: <Navigate to="/agronomist/dashboard" replace /> },
  { path: '/agronomist/dashboard',     element: <Layout><AgronomistDashboard /></Layout> },
  { path: '/agronomist/farmers',       element: <Layout><AgronomistFarmers /></Layout> },
  { path: '/agronomist/fields',        element: <Layout><AgronomistFields /></Layout> },
  { path: '/agronomist/recommendations', element: <Layout><AgronomistRecommendations /></Layout> },
  { path: '/agronomist/crop-library',  element: <Layout><AgronomistCropLibrary /></Layout> },
  { path: '/agronomist/analytics',     element: <Layout><AgronomistAnalytics /></Layout> },
  { path: '/agronomist/reports',       element: <Layout><AgronomistReports /></Layout> },

  // Admin
  { path: '/admin',               element: <Navigate to="/admin/dashboard" replace /> },
  { path: '/admin/dashboard',     element: <Layout><AdminDashboard /></Layout> },
  { path: '/admin/users',         element: <Layout><AdminUsers /></Layout> },
  { path: '/admin/crops',         element: <Layout><AdminCrops /></Layout> },
  { path: '/admin/analytics',     element: <Layout><AdminAnalytics /></Layout> },
  { path: '/admin/notifications', element: <Layout><AdminNotifications /></Layout> },
  { path: '/admin/settings',      element: <Layout><AdminSettings /></Layout> },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);
