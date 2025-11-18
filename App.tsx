
import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth';
import { Layout, PrivateRoute } from './components';
import {
  HomePage,
  PricingPage,
  PurchaseSuccessPage,
  LoginPage,
  DashboardPage,
  GenerateProductPage,
  ProductsPage,
  SubscriptionPage,
  SettingsPage,
  AdminUsersPage,
  NotFoundPage,
} from './pages';

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/purchase-success" element={<PurchaseSuccessPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Private Routes */}
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/generate" element={<PrivateRoute><GenerateProductPage /></PrivateRoute>} />
            <Route path="/products" element={<PrivateRoute><ProductsPage /></PrivateRoute>} />
            <Route path="/subscription" element={<PrivateRoute><SubscriptionPage /></PrivateRoute>} />
            <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />
            <Route path="/admin/users" element={<PrivateRoute adminOnly={true}><AdminUsersPage /></PrivateRoute>} />
            
            {/* Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;