import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import AmbilAntrean from './pages/AmbilAntrean';
import StatusAntrean from './pages/StatusAntrean';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ManajemenLayanan from './pages/ManajemenLayanan';
import Statistik from './pages/Statistik';
import QrAntrean from './pages/QrAntrean';
import './App.css';

function ProtectedRoute() {
  const { pengguna, loading } = useAuth();
  if (loading) return <div className="app-loading"><div className="loader"></div></div>;
  if (!pengguna) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function PublicLayout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function PetugasLayout() {
  return (
    <div className="petugas-layout">
      <Sidebar />
      <main className="petugas-content">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<AmbilAntrean />} />
            <Route path="/status/:kode" element={<StatusAntrean />} />
            <Route path="/qr" element={<QrAntrean />} />
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Protected petugas routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PetugasLayout />}>
              <Route path="/petugas" element={<Dashboard />} />
              <Route path="/petugas/layanan" element={<ManajemenLayanan />} />
              <Route path="/petugas/statistik" element={<Statistik />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
