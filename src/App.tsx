/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AdminCommissions from './pages/AdminCommissions';
import AdminPayouts from './pages/AdminPayouts';
import Auth from './pages/Auth';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import Settings from './pages/Settings';
import Navbar from './components/Navbar';
import DashboardLayout from './components/DashboardLayout';
import { LanguageProvider } from './contexts/LanguageContext';

function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-200">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          {/* Public Routes with Navbar */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/success" element={<Success />} />
            <Route path="/cancel" element={<Cancel />} />
            <Route path="/auth" element={<Auth />} />
          </Route>

          {/* Dashboard Routes with Sidebar */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/seller" element={<SellerDashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/commissions" element={<AdminCommissions />} />
            <Route path="/admin/payouts" element={<AdminPayouts />} />
          </Route>
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
