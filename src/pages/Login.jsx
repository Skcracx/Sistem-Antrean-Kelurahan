import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/petugas');
    } catch (err) {
      setError(err.response?.data?.pesan || 'Login gagal');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-header">
          <span style={{ fontSize: 36 }}>🏛️</span>
          <h1 className="text-headline-md">Login Petugas</h1>
          <p className="text-body-sm text-muted">Masuk ke panel petugas kelurahan</p>
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="login-fields">
          <Input
            id="username"
            label="Username"
            placeholder="Masukkan username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={loading} className="login-btn">
          {loading ? 'Memproses...' : 'Masuk'}
        </Button>

        <p className="login-hint text-body-sm text-muted">Default: admin / admin123</p>
      </form>
    </div>
  );
}
