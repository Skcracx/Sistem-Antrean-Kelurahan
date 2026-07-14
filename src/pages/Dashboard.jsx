import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import Button from '../components/Button';
import QueueDisplay from '../components/QueueDisplay';
import './Dashboard.css';

export default function Dashboard() {
  const { authHeader } = useAuth();
  const [antrean, setAntrean] = useState([]);
  const [stats, setStats] = useState({ total: 0, menunggu: 0, dipanggil: 0, selesai: 0, dilewati: 0 });

  const fetchData = async () => {
    try {
      const [aRes, sRes] = await Promise.all([
        axios.get('/api/antrean/hari-ini', authHeader()),
        axios.get('/api/statistik', authHeader()),
      ]);
      setAntrean(aRes.data);
      setStats(sRes.data);
    } catch {}
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  const aktif = antrean.find(a => a.status_antrean === 'dipanggil');
  const menungguList = antrean.filter(a => a.status_antrean === 'menunggu');
  const selesaiList = antrean.filter(a => a.status_antrean === 'selesai' || a.status_antrean === 'dilewati');

  const handlePanggil = async () => {
    try {
      await axios.put('/api/antrean/panggil-berikutnya', {}, authHeader());
      fetchData();
    } catch (err) {
      alert(err.response?.data?.pesan || 'Gagal memanggil');
    }
  };

  const handleSelesai = async (id) => {
    await axios.put(`/api/antrean/${id}/selesai`, {}, authHeader());
    fetchData();
  };

  const handleLewati = async (id) => {
    await axios.put(`/api/antrean/${id}/lewati`, {}, authHeader());
    fetchData();
  };

  return (
    <div className="dashboard">
      <h1 className="text-headline-lg dash-title">Dashboard Antrean</h1>

      <div className="stats-grid">
        <StatCard label="Total Hari Ini" value={stats.total} icon="📋" color="primary" />
        <StatCard label="Menunggu" value={stats.menunggu} icon="⏳" color="warning" />
        <StatCard label="Dipanggil" value={stats.dipanggil} icon="📢" color="primary" />
        <StatCard label="Selesai" value={stats.selesai} icon="✅" color="success" />
      </div>

      <div className="dash-grid">
        <div className="dash-main">
          <div className="dash-section">
            <div className="section-header">
              <h2 className="text-title-md">Antrean Aktif</h2>
            </div>
            {aktif ? (
              <div className="active-queue-box">
                <QueueDisplay queueNumber={aktif.nomor_antrean} serviceCategory={aktif.nama_layanan} size="sm" />
                {aktif.nama_warga && <p className="active-nama">👤 {aktif.nama_warga}</p>}
                {aktif.nama_jenis_layanan && <p className="active-jenis text-body-sm text-muted">{aktif.nama_jenis_layanan}</p>}
                <div className="active-actions">
                  <Button variant="success" onClick={() => handleSelesai(aktif.id_antrean)}>✓ Selesai</Button>
                  <Button variant="warning" onClick={() => handleLewati(aktif.id_antrean)}>⏭ Lewati</Button>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <p className="text-body-md text-muted">Tidak ada antrean yang sedang dilayani</p>
                <Button variant="primary" size="lg" onClick={handlePanggil} disabled={menungguList.length === 0}>
                  📢 Panggil Antrean Berikutnya
                </Button>
              </div>
            )}
          </div>

          <div className="dash-section">
            <div className="section-header">
              <h2 className="text-title-md">Menunggu ({menungguList.length})</h2>
              {!aktif && menungguList.length > 0 && (
                <Button variant="primary" size="sm" onClick={handlePanggil}>📢 Panggil Berikutnya</Button>
              )}
            </div>
            {menungguList.length === 0 ? (
              <p className="text-body-sm text-muted" style={{ padding: 16 }}>Tidak ada antrean menunggu</p>
            ) : (
              <div className="queue-list">
                {menungguList.map(a => (
                  <div key={a.id_antrean} className="queue-item">
                    <div className="queue-item-left">
                      <span className="queue-item-number">{a.nomor_antrean}</span>
                      <div>
                        <div className="text-body-md fw-600">{a.nama_layanan}</div>
                        {a.nama_warga && <div className="text-body-sm" style={{ color: 'var(--on-surface)' }}>👤 {a.nama_warga}</div>}
                        <div className="text-body-sm text-muted">
                          {a.nama_jenis_layanan || 'Lainnya'} · {new Date(a.waktu_daftar).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                    <div className="queue-item-right">
                      <Badge status={a.status_antrean} />
                      {!aktif && (
                        <Button variant="primary" size="sm" onClick={() => {
                          axios.put(`/api/antrean/${a.id_antrean}/panggil`, {}, authHeader()).then(fetchData);
                        }}>Panggil</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dash-side">
          <div className="dash-section">
            <h2 className="text-title-md" style={{ marginBottom: 16 }}>Riwayat ({selesaiList.length})</h2>
            {selesaiList.length === 0 ? (
              <p className="text-body-sm text-muted">Belum ada riwayat</p>
            ) : (
              <div className="history-list">
                {selesaiList.slice(0, 20).map(a => (
                  <div key={a.id_antrean} className="history-item">
                    <span className="history-number">{a.nomor_antrean}</span>
                    <div style={{ flex: 1 }}>
                      <span className="text-body-sm">{a.nama_warga || '-'}</span>
                    </div>
                    <Badge status={a.status_antrean} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
