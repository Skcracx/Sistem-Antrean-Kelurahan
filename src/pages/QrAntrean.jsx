import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Button from '../components/Button';
import './AmbilAntrean.css';

export default function QrAntrean() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.post('/api/antrean/qr')
      .then(r => { setResult(r.data); setLoading(false); })
      .catch(err => { setError(err.response?.data?.pesan || 'Gagal mengambil antrean'); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="ambil-page">
        <div className="ambil-result">
          <div className="loader"></div>
          <p className="text-body-md text-muted" style={{ marginTop: 16 }}>Mengambil nomor antrean...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ambil-page">
        <div className="ambil-result">
          <div style={{ fontSize: 48 }}>😕</div>
          <h2 className="text-headline-md">{error}</h2>
          <Button variant="primary" onClick={() => navigate('/')}>Kembali</Button>
        </div>
      </div>
    );
  }

  if (result) {
    const statusUrl = `${window.location.origin}/status/${result.kode_unik}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(statusUrl)}&bgcolor=282a32&color=e2e8f0`;

    return (
      <div className="ambil-page">
        <div className="ambil-result">
          <div className="result-icon">✅</div>
          <h1 className="text-headline-lg">Antrean Layanan Sosial</h1>
          <p className="text-body-lg text-muted" style={{ marginTop: 8 }}>Nomor antrean Anda hari ini</p>

          <div className="result-number-box">
            <div className="result-number">{result.nomor_antrean}</div>
            <div className="result-service">{result.nama_layanan}</div>
          </div>

          <div className="result-qr">
            <p className="text-body-md text-muted" style={{ marginBottom: 12 }}>Scan QR untuk cek status:</p>
            <div className="qr-wrapper">
              <img src={qrUrl} alt="QR Code" width="160" height="160" style={{ borderRadius: 8 }} />
            </div>
          </div>

          <div className="result-actions">
            <Button variant="primary" size="lg" onClick={() => navigate(`/status/${result.kode_unik}`)}>
              Lihat Status Antrean
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
