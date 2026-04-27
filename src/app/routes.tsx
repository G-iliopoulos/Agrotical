import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import FarmerDashboard from './pages/farmer/FarmerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AgronomistDashboard from './pages/agronomist/AgronomistDashboard';

export const router = createBrowserRouter([
  { path: '/', Component: LoginPage },
  { path: '/farmer/dashboard', element: <Layout><FarmerDashboard /></Layout> },
  { path: '/admin/dashboard',  element: <Layout><AdminDashboard /></Layout> },
  { path: '/agronomist/dashboard', element: <Layout><AgronomistDashboard /></Layout> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
