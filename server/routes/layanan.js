const router = require('express').Router();
const db = require('../database');
const auth = require('../middleware/auth');

// GET all active layanan/kategori (public)
router.get('/', (req, res) => {
  const layanan = db.prepare('SELECT * FROM layanan WHERE aktif = 1 ORDER BY id_layanan').all();
  res.json(layanan);
});

// GET all layanan including inactive (petugas)
router.get('/semua', auth, (req, res) => {
  const layanan = db.prepare('SELECT * FROM layanan ORDER BY id_layanan').all();
  res.json(layanan);
});

// GET jenis layanan by kategori (public)
router.get('/:id/jenis', (req, res) => {
  const jenis = db.prepare('SELECT * FROM jenis_layanan WHERE id_layanan = ? AND aktif = 1 ORDER BY id_jenis_layanan').all(req.params.id);
  res.json(jenis);
});

// GET all jenis layanan by kategori including inactive (petugas)
router.get('/:id/jenis/semua', auth, (req, res) => {
  const jenis = db.prepare('SELECT * FROM jenis_layanan WHERE id_layanan = ? ORDER BY id_jenis_layanan').all(req.params.id);
  res.json(jenis);
});

// POST create kategori layanan
router.post('/', auth, (req, res) => {
  const { nama_layanan, deskripsi, kode_prefix } = req.body;
  if (!nama_layanan) return res.status(400).json({ pesan: 'Nama kategori wajib diisi' });
  if (!kode_prefix) return res.status(400).json({ pesan: 'Kode prefix wajib diisi' });

  const result = db.prepare('INSERT INTO layanan (nama_layanan, deskripsi, kode_prefix) VALUES (?, ?, ?)').run(nama_layanan, deskripsi || '', kode_prefix);
  res.json({ id_layanan: result.lastInsertRowid, nama_layanan, deskripsi: deskripsi || '', kode_prefix, aktif: 1 });
});

// PUT update kategori layanan
router.put('/:id', auth, (req, res) => {
  const { nama_layanan, deskripsi, kode_prefix } = req.body;
  if (!nama_layanan) return res.status(400).json({ pesan: 'Nama kategori wajib diisi' });

  if (kode_prefix !== undefined) {
    db.prepare('UPDATE layanan SET nama_layanan = ?, deskripsi = ?, kode_prefix = ? WHERE id_layanan = ?').run(nama_layanan, deskripsi || '', kode_prefix, req.params.id);
  } else {
    db.prepare('UPDATE layanan SET nama_layanan = ?, deskripsi = ? WHERE id_layanan = ?').run(nama_layanan, deskripsi || '', req.params.id);
  }
  res.json({ pesan: 'Kategori berhasil diperbarui' });
});

// DELETE kategori layanan (soft delete)
router.delete('/:id', auth, (req, res) => {
  db.prepare('UPDATE layanan SET aktif = 0 WHERE id_layanan = ?').run(req.params.id);
  res.json({ pesan: 'Kategori berhasil dinonaktifkan' });
});

// ---- Jenis Layanan (sub-service) CRUD ----

// POST create jenis layanan
router.post('/jenis', auth, (req, res) => {
  const { nama_jenis_layanan, id_layanan } = req.body;
  if (!nama_jenis_layanan || !id_layanan) return res.status(400).json({ pesan: 'Data tidak lengkap' });

  const result = db.prepare('INSERT INTO jenis_layanan (nama_jenis_layanan, id_layanan) VALUES (?, ?)').run(nama_jenis_layanan, id_layanan);
  res.json({ id_jenis_layanan: result.lastInsertRowid, nama_jenis_layanan, id_layanan, aktif: 1 });
});

// PUT update jenis layanan
router.put('/jenis/:id', auth, (req, res) => {
  const { nama_jenis_layanan } = req.body;
  if (!nama_jenis_layanan) return res.status(400).json({ pesan: 'Nama jenis layanan wajib diisi' });

  db.prepare('UPDATE jenis_layanan SET nama_jenis_layanan = ? WHERE id_jenis_layanan = ?').run(nama_jenis_layanan, req.params.id);
  res.json({ pesan: 'Jenis layanan berhasil diperbarui' });
});

// DELETE jenis layanan (soft delete)
router.delete('/jenis/:id', auth, (req, res) => {
  db.prepare('UPDATE jenis_layanan SET aktif = 0 WHERE id_jenis_layanan = ?').run(req.params.id);
  res.json({ pesan: 'Jenis layanan berhasil dihapus' });
});

module.exports = router;
