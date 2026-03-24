/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AdminCommissions from './pages/AdminCommissions';
import AdminPayouts from './pages/AdminPayouts';
import Auth from './pages/Auth';
import ProductDetails from './pages/ProductDetails';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/SellerDashboard';
import Navbar from './components/Navbar';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-neutral-200">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/commissions" element={<AdminCommissions />} />
              <Route path="/admin/payouts" element={<AdminPayouts />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}
