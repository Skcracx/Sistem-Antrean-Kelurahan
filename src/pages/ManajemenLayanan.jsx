import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import './ManajemenLayanan.css';

export default function ManajemenLayanan() {
  const { authHeader } = useAuth();
  const [list, setList] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ nama_layanan: '', deskripsi: '', kode_prefix: '' });

  // Jenis layanan state
  const [expandedKat, setExpandedKat] = useState(null);
  const [jenisList, setJenisList] = useState([]);
  const [jenisModal, setJenisModal] = useState(false);
  const [editingJenis, setEditingJenis] = useState(null);
  const [jenisForm, setJenisForm] = useState('');

  const fetchData = () => {
    axios.get('/api/layanan/semua', authHeader()).then(r => setList(r.data)).catch(() => {});
  };

  useEffect(() => { fetchData(); }, []);

  const fetchJenis = async (idLayanan) => {
    try {
      const res = await axios.get(`/api/layanan/${idLayanan}/jenis/semua`, authHeader());
      setJenisList(res.data);
    } catch { setJenisList([]); }
  };

  const toggleExpand = (id) => {
    if (expandedKat === id) {
      setExpandedKat(null);
    } else {
      setExpandedKat(id);
      fetchJenis(id);
    }
  };

  // Kategori CRUD
  const openAdd = () => { setEditing(null); setForm({ nama_layanan: '', deskripsi: '', kode_prefix: '' }); setModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({ nama_layanan: item.nama_layanan, deskripsi: item.deskripsi || '', kode_prefix: item.kode_prefix || '' });
    setModal(true);
  };

  const handleSubmit = async () => {
    if (!form.nama_layanan.trim()) return;
    if (!form.kode_prefix.trim()) return alert('Kode prefix wajib diisi (contoh: A, P, SK, L)');
    try {
      if (editing) {
        await axios.put(`/api/layanan/${editing.id_layanan}`, form, authHeader());
      } else {
        await axios.post('/api/layanan', form, authHeader());
      }
      setModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.pesan || 'Gagal menyimpan');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Nonaktifkan kategori layanan ini?')) return;
    await axios.delete(`/api/layanan/${id}`, authHeader());
    fetchData();
  };

  // Jenis layanan CRUD
  const openAddJenis = () => { setEditingJenis(null); setJenisForm(''); setJenisModal(true); };
  const openEditJenis = (j) => { setEditingJenis(j); setJenisForm(j.nama_jenis_layanan); setJenisModal(true); };

  const handleJenisSubmit = async () => {
    if (!jenisForm.trim()) return;
    try {
      if (editingJenis) {
        await axios.put(`/api/layanan/jenis/${editingJenis.id_jenis_layanan}`, { nama_jenis_layanan: jenisForm.trim() }, authHeader());
      } else {
        await axios.post('/api/layanan/jenis', { nama_jenis_layanan: jenisForm.trim(), id_layanan: expandedKat }, authHeader());
      }
      setJenisModal(false);
      fetchJenis(expandedKat);
    } catch (err) {
      alert(err.response?.data?.pesan || 'Gagal menyimpan');
    }
  };

  const handleJenisDelete = async (id) => {
    if (!confirm('Hapus jenis layanan ini?')) return;
    await axios.delete(`/api/layanan/jenis/${id}`, authHeader());
    fetchJenis(expandedKat);
  };

  return (
    <div className="layanan-page">
      <div className="layanan-header">
        <div>
          <h1 className="text-headline-lg">Manajemen Layanan</h1>
          <p className="text-body-md text-muted">Kelola kategori layanan dan daftar jenis layanan (dropdown) untuk masyarakat.</p>
        </div>
        <Button variant="primary" onClick={openAdd}>+ Tambah Kategori</Button>
      </div>

      <div className="kategori-list">
        {list.map(item => (
          <div key={item.id_layanan} className={`kategori-row ${!item.aktif ? 'row-inactive' : ''}`}>
            <div className="kategori-main" onClick={() => toggleExpand(item.id_layanan)}>
              <div className="kategori-left">
                <span className="kategori-expand">{expandedKat === item.id_layanan ? '▼' : '▶'}</span>
                <span className="kategori-badge">{item.kode_prefix}</span>
                <div>
                  <div className="fw-600">{item.nama_layanan}</div>
                  <div className="text-body-sm text-muted">{item.deskripsi || 'Belum ada deskripsi'}</div>
                </div>
              </div>
              <div className="kategori-right">
                <span className={`status-dot ${item.aktif ? 'active' : 'inactive'}`}>
                  {item.aktif ? 'Aktif' : 'Nonaktif'}
                </span>
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEdit(item); }}>✏️ Edit</Button>
                {item.aktif && <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDelete(item.id_layanan); }}>🗑️</Button>}
              </div>
            </div>

            {expandedKat === item.id_layanan && (
              <div className="jenis-panel">
                <div className="jenis-header">
                  <span className="text-label-md">Daftar Jenis Layanan (Menu Dropdown)</span>
                  <Button variant="primary" size="sm" onClick={openAddJenis}>+ Tambah Jenis</Button>
                </div>
                {jenisList.length === 0 ? (
                  <p className="text-body-sm text-muted" style={{ padding: '8px 0' }}>Belum ada jenis layanan. Tambahkan agar muncul di dropdown warga.</p>
                ) : (
                  <div className="jenis-list">
                    {jenisList.map(j => (
                      <div key={j.id_jenis_layanan} className={`jenis-item ${!j.aktif ? 'row-inactive' : ''}`}>
                        <span>{j.nama_jenis_layanan}</span>
                        <div className="jenis-actions">
                          <Button variant="ghost" size="sm" onClick={() => openEditJenis(j)}>✏️</Button>
                          {j.aktif && <Button variant="ghost" size="sm" onClick={() => handleJenisDelete(j.id_jenis_layanan)}>🗑️</Button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-body-sm text-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>
                  💡 Opsi "Lainnya" akan otomatis muncul di dropdown masyarakat.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Modal Kategori */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title={editing ? 'Edit Kategori Layanan' : 'Tambah Kategori Baru'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Nama Kategori" placeholder="Contoh: Administrasi" value={form.nama_layanan} onChange={e => setForm({ ...form, nama_layanan: e.target.value })} required />
          <Input label="Kode Prefix" placeholder="Contoh: A, P, SK, L" value={form.kode_prefix} onChange={e => setForm({ ...form, kode_prefix: e.target.value.toUpperCase() })} required />
          <div className="input-group">
            <label className="input-label">Deskripsi Layanan</label>
            <textarea
              className="input-field textarea-field"
              placeholder="Deskripsi layanan yang termasuk dalam kategori ini..."
              value={form.deskripsi}
              onChange={e => setForm({ ...form, deskripsi: e.target.value })}
              rows={3}
            />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <Button variant="secondary" onClick={() => setModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleSubmit}>{editing ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Jenis Layanan */}
      <Modal isOpen={jenisModal} onClose={() => setJenisModal(false)} title={editingJenis ? 'Edit Jenis Layanan' : 'Tambah Jenis Layanan'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            label="Nama Jenis Layanan"
            placeholder="Contoh: Surat Keterangan Domisili"
            value={jenisForm}
            onChange={e => setJenisForm(e.target.value)}
            required
          />
          <p className="text-body-sm text-muted">Nama ini akan muncul sebagai pilihan dropdown saat masyarakat memilih kategori layanan.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button variant="secondary" onClick={() => setJenisModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleJenisSubmit}>{editingJenis ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
