import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Card from '../components/Card';
import Button from '../components/Button';
import './AmbilAntrean.css';

const kategoriIcons = {
  'Administrasi': '📝',
  'Pencatatan Sipil': '👤',
  'Surat Keterangan': '📄',
  'Layanan Sosial': '🤝',
};

export default function AmbilAntrean() {
  const [kategoriList, setKategoriList] = useState([]);
  const [selected, setSelected] = useState(null);
  const [jenisOptions, setJenisOptions] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState('');
  const [namaWarga, setNamaWarga] = useState('');
  const [step, setStep] = useState(1); // 1 = pilih kategori, 2 = isi detail
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/layanan').then(r => setKategoriList(r.data)).catch(() => {});
  }, []);

  const handleSelectKategori = async (id) => {
    setSelected(id);
    try {
      const res = await axios.get(`/api/layanan/${id}/jenis`);
      setJenisOptions(res.data);
    } catch { setJenisOptions([]); }
    setSelectedJenis('');
    setNamaWarga('');
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelected(null);
    setSelectedJenis('');
    setNamaWarga('');
  };

  const handleSubmit = async () => {
    if (!namaWarga.trim()) return alert('Silakan isi nama Anda');
    if (!selectedJenis) return alert('Silakan pilih jenis layanan');
    setLoading(true);
    try {
      const jenisId = selectedJenis === 'lainnya' ? null : parseInt(selectedJenis);
      const res = await axios.post('/api/antrean', {
        id_layanan: selected,
        id_jenis_layanan: jenisId,
        nama_warga: namaWarga.trim(),
      });
      setResult(res.data);
    } catch (err) {
      alert(err.response?.data?.pesan || 'Terjadi kesalahan');
    }
    setLoading(false);
  };

  // --- RESULT VIEW ---
  if (result) {
    const statusUrl = `${window.location.origin}/status/${result.kode_unik}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(statusUrl)}&bgcolor=282a32&color=e2e8f0`;
    const selectedKat = kategoriList.find(k => k.id_layanan === result.id_layanan);

    return (
      <div className="ambil-page">
        <div className="ambil-result">
          <div className="result-icon">✅</div>
          <h1 className="text-headline-lg">Antrean Berhasil Diambil!</h1>
          <p className="text-body-lg text-muted" style={{ marginTop: 8 }}>Nomor antrean Anda hari ini</p>

          <div className="result-number-box">
            <div className="result-number">{result.nomor_antrean}</div>
            <div className="result-service">{result.nama_layanan}</div>
            {result.nama_warga && <div className="result-nama">Atas nama: <strong>{result.nama_warga}</strong></div>}
          </div>

          <div className="result-qr">
            <p className="text-body-md text-muted" style={{ marginBottom: 12 }}>Scan QR untuk cek status antrean:</p>
            <div className="qr-wrapper">
              <img src={qrUrl} alt="QR Code" width="160" height="160" style={{ borderRadius: 8 }} />
            </div>
            <p className="text-body-sm text-muted" style={{ marginTop: 8, fontSize: 11, wordBreak: 'break-all', maxWidth: 300 }}>
              {statusUrl}
            </p>
          </div>

          <div className="result-actions">
            <Button variant="primary" size="lg" onClick={() => navigate(`/status/${result.kode_unik}`)}>
              Lihat Status Antrean
            </Button>
            <Button variant="secondary" onClick={() => { setResult(null); setSelected(null); setStep(1); setNamaWarga(''); setSelectedJenis(''); }}>
              Ambil Antrean Lagi
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 2: DETAIL ---
  if (step === 2 && selected) {
    const kat = kategoriList.find(k => k.id_layanan === selected);
    return (
      <div className="ambil-page">
        <div className="ambil-container">
          <header className="ambil-header">
            <button className="back-btn" onClick={handleBack}>← Kembali</button>
            <h1 className="text-headline-md">
              <span className="kat-icon">{kategoriIcons[kat?.nama_layanan] || '📋'}</span>
              {kat?.nama_layanan}
            </h1>
            <p className="text-body-md text-muted">{kat?.deskripsi}</p>
          </header>

          <div className="detail-form">
            <div className="form-group">
              <label className="form-label">Nama Lengkap <span className="required">*</span></label>
              <input
                type="text"
                className="form-input"
                placeholder="Masukkan nama lengkap Anda"
                value={namaWarga}
                onChange={e => setNamaWarga(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Jenis Layanan <span className="required">*</span></label>
              <select
                className="form-input form-select"
                value={selectedJenis}
                onChange={e => setSelectedJenis(e.target.value)}
              >
                <option value="">-- Pilih jenis layanan --</option>
                {jenisOptions.map(j => (
                  <option key={j.id_jenis_layanan} value={j.id_jenis_layanan}>
                    {j.nama_jenis_layanan}
                  </option>
                ))}
                <option value="lainnya">Lainnya</option>
              </select>
              <span className="form-hint">Pilih "Lainnya" jika layanan yang Anda butuhkan tidak ada dalam daftar</span>
            </div>

            <div className="form-actions">
              <Button variant="secondary" onClick={handleBack}>Kembali</Button>
              <Button variant="primary" size="lg" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Memproses...' : 'Ambil Nomor Antrean'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- STEP 1: KATEGORI ---
  return (
    <div className="ambil-page">
      <div className="ambil-container">
        <header className="ambil-header">
          <h1 className="text-display-md">Ambil Antrean</h1>
          <p className="text-body-lg text-muted">Pilih kategori layanan yang Anda butuhkan</p>
        </header>

        <div className="kategori-grid">
          {kategoriList.map(k => (
            <Card
              key={k.id_layanan}
              className="kategori-card card-clickable"
              onClick={() => handleSelectKategori(k.id_layanan)}
            >
              <div className="kategori-icon">{kategoriIcons[k.nama_layanan] || '📋'}</div>
              <h3 className="kategori-name">{k.nama_layanan}</h3>
              {k.deskripsi && <p className="kategori-desc">{k.deskripsi}</p>}
              <span className="kategori-prefix">{k.kode_prefix}</span>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
