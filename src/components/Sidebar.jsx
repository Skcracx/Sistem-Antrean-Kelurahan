import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const menuItems = [
  { path: '/petugas', label: 'Dashboard', icon: '📊' },
  { path: '/petugas/layanan', label: 'Manajemen Layanan', icon: '📋' },
  { path: '/petugas/statistik', label: 'Statistik', icon: '📈' },
];

export default function Sidebar() {
  const { pengguna, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-icon">🏛️</span>
        <div>
          <div className="sidebar-title">Panel Petugas</div>
          <div className="sidebar-subtitle">{pengguna?.nama}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/petugas'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-logout" onClick={handleLogout}>
          🚪 Keluar
        </button>
      </div>
    </aside>
  );
}
