import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { pengguna, logout } = useAuth();
  const location = useLocation();
  const isPetugas = location.pathname.startsWith('/petugas') || location.pathname === '/login';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🏛️</span>
          <span className="brand-text">Pelayanan<span className="brand-accent">Kelurahan</span></span>
        </Link>

        <div className="navbar-actions">
          {!isPetugas && (
            <>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Ambil Antrean</Link>
              <Link to="/login" className="nav-link nav-petugas">Petugas</Link>
            </>
          )}
          {pengguna && (
            <>
              <span className="nav-user">👤 {pengguna.nama}</span>
              <button className="nav-logout" onClick={logout}>Keluar</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
