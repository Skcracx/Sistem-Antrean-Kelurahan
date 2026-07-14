import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Badge from '../components/Badge';
import './StatusAntrean.css';

export default function StatusAntrean() {
  const { kode } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const fetchStatus = () => {
    axios.get(`/api/antrean/status/${kode}`)
      .then(r => { setData(r.data); setError(null); })
      .catch(() => setError('Antrean tidak ditemukan'));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [kode]);

  if (error) {
    return (
      <div className="status-page">
        <div className="status-error">
          <div style={{ fontSize: 48 }}>😕</div>
          <h2 className="text-headline-md">{error}</h2>
          <p className="text-body-md text-muted">Pastikan kode antrean Anda benar</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="status-page">
        <div className="status-loading">
          <div className="loader"></div>
          <p className="text-body-md text-muted">Memuat status antrean...</p>
        </div>
      </div>
    );
  }

  const { antrean, antrean_aktif, jumlah_depan } = data;

  return (
    <div className="status-page">
      <div className="status-container">
        <h1 className="text-headline-lg" style={{ marginBottom: 8 }}>Status Antrean Anda</h1>
        <p className="text-body-md text-muted" style={{ marginBottom: 32 }}>
          Halaman ini diperbarui otomatis setiap 3 detik
        </p>

        <div className="status-main-card">
          <div className="status-your-queue">
            <span className="text-label-md" style={{ color: 'var(--on-surface-variant)' }}>Nomor Antrean Anda</span>
            <div className="status-your-number">{antrean.nomor_antrean}</div>
            <div className="status-service">{antrean.nama_layanan}</div>
            <Badge status={antrean.status_antrean} />
          </div>
        </div>

        <div className="status-info-grid">
          <div className="status-info-card">
            <span className="text-label-md text-muted">Sedang Dilayani</span>
            <div className="info-number active">{antrean_aktif ? antrean_aktif.nomor_antrean : '---'}</div>
          </div>
          <div className="status-info-card">
            <span className="text-label-md text-muted">Antrean di Depan Anda</span>
            <div className="info-number waiting">
              {antrean.status_antrean === 'menunggu' ? jumlah_depan : (antrean.status_antrean === 'dipanggil' ? '0' : '---')}
            </div>
          </div>
        </div>

        {antrean.status_antrean === 'dipanggil' && (
          <div className="status-alert">
            <div className="alert-pulse"></div>
            <span className="text-title-md">Giliran Anda! Silakan menuju loket.</span>
          </div>
        )}

        {antrean.status_antrean === 'selesai' && (
          <div className="status-done">
            <span style={{ fontSize: 32 }}>✅</span>
            <span className="text-title-md">Antrean Anda telah selesai dilayani</span>
          </div>
        )}
      </div>
    </div>
  );
}
