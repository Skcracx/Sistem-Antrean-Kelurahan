const router = require('express').Router();
const crypto = require('crypto');
const db = require('../database');
const auth = require('../middleware/auth');

function hariIni() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function generateNomorAntrean(kodePrefix) {
  const today = hariIni();
  const last = db.prepare(
    "SELECT nomor_antrean FROM antrean WHERE date(waktu_daftar) = ? AND nomor_antrean LIKE ? ORDER BY id_antrean DESC LIMIT 1"
  ).get(today, `${kodePrefix}%`);

  let nextNum = 1;
  if (last) {
    const numPart = last.nomor_antrean.replace(kodePrefix, '');
    nextNum = parseInt(numPart, 10) + 1;
  }
  return `${kodePrefix}${String(nextNum).padStart(2, '0')}`;
}

// POST create antrean (public - masyarakat)
router.post('/', (req, res) => {
  const { id_layanan, id_jenis_layanan, nama_warga } = req.body;
  if (!id_layanan) return res.status(400).json({ pesan: 'Pilih kategori layanan terlebih dahulu' });

  const layanan = db.prepare('SELECT * FROM layanan WHERE id_layanan = ? AND aktif = 1').get(id_layanan);
  if (!layanan) return res.status(404).json({ pesan: 'Kategori layanan tidak ditemukan' });

  const nomorAntrean = generateNomorAntrean(layanan.kode_prefix);
  const kodeUnik = crypto.randomBytes(8).toString('hex');

  const result = db.prepare(
    "INSERT INTO antrean (kode_unik, nomor_antrean, nama_warga, status_antrean, id_layanan, id_jenis_layanan, sumber) VALUES (?, ?, ?, 'menunggu', ?, ?, ?)"
  ).run(kodeUnik, nomorAntrean, nama_warga || '', id_layanan, id_jenis_layanan || null, 'manual');

  const antrean = db.prepare(
    "SELECT a.*, l.nama_layanan, l.kode_prefix FROM antrean a JOIN layanan l ON a.id_layanan = l.id_layanan WHERE a.id_antrean = ?"
  ).get(result.lastInsertRowid);
  res.json(antrean);
});

// POST create antrean via QR (public - auto Layanan Sosial)
router.post('/qr', (req, res) => {
  const layanan = db.prepare("SELECT * FROM layanan WHERE nama_layanan = 'Layanan Sosial' AND aktif = 1").get();
  if (!layanan) return res.status(404).json({ pesan: 'Kategori Layanan Sosial tidak ditemukan' });

  const nomorAntrean = generateNomorAntrean(layanan.kode_prefix);
  const kodeUnik = crypto.randomBytes(8).toString('hex');

  const result = db.prepare(
    "INSERT INTO antrean (kode_unik, nomor_antrean, nama_warga, status_antrean, id_layanan, id_jenis_layanan, sumber) VALUES (?, ?, '', 'menunggu', ?, NULL, 'qr')"
  ).run(kodeUnik, nomorAntrean, layanan.id_layanan);

  const antrean = db.prepare(
    "SELECT a.*, l.nama_layanan, l.kode_prefix FROM antrean a JOIN layanan l ON a.id_layanan = l.id_layanan WHERE a.id_antrean = ?"
  ).get(result.lastInsertRowid);
  res.json(antrean);
});

// GET antrean status by kode_unik (public)
router.get('/status/:kode', (req, res) => {
  const antrean = db.prepare(
    `SELECT a.*, l.nama_layanan, l.kode_prefix,
     COALESCE(j.nama_jenis_layanan, '') as nama_jenis_layanan
     FROM antrean a
     JOIN layanan l ON a.id_layanan = l.id_layanan
     LEFT JOIN jenis_layanan j ON a.id_jenis_layanan = j.id_jenis_layanan
     WHERE a.kode_unik = ?`
  ).get(req.params.kode);
  if (!antrean) return res.status(404).json({ pesan: 'Antrean tidak ditemukan' });

  const today = hariIni();
  const aktif = db.prepare(
    `SELECT a.nomor_antrean, l.nama_layanan FROM antrean a
     JOIN layanan l ON a.id_layanan = l.id_layanan
     WHERE date(a.waktu_daftar) = ? AND a.status_antrean = 'dipanggil'
     ORDER BY a.waktu_panggil DESC LIMIT 1`
  ).get(today);

  // Count people ahead within same category
  const depan = db.prepare(
    `SELECT COUNT(*) as jumlah FROM antrean
     WHERE date(waktu_daftar) = ? AND status_antrean = 'menunggu'
     AND id_layanan = ? AND id_antrean < ?`
  ).get(today, antrean.id_layanan, antrean.id_antrean);

  res.json({ antrean, antrean_aktif: aktif || null, jumlah_depan: depan.jumlah });
});

// GET today's queues (petugas)
router.get('/hari-ini', auth, (req, res) => {
  const today = hariIni();
  const list = db.prepare(
    `SELECT a.*, l.nama_layanan, l.kode_prefix,
     COALESCE(j.nama_jenis_layanan, '') as nama_jenis_layanan
     FROM antrean a
     JOIN layanan l ON a.id_layanan = l.id_layanan
     LEFT JOIN jenis_layanan j ON a.id_jenis_layanan = j.id_jenis_layanan
     WHERE date(a.waktu_daftar) = ? ORDER BY a.id_antrean ASC`
  ).all(today);
  res.json(list);
});

// PUT panggil antrean
router.put('/:id/panggil', auth, (req, res) => {
  db.prepare("UPDATE antrean SET status_antrean = 'dipanggil', waktu_panggil = datetime('now','localtime') WHERE id_antrean = ?").run(req.params.id);
  res.json({ pesan: 'Antrean dipanggil' });
});

// PUT panggil berikutnya (auto)
router.put('/panggil-berikutnya', auth, (req, res) => {
  const today = hariIni();
  const next = db.prepare("SELECT * FROM antrean WHERE date(waktu_daftar) = ? AND status_antrean = 'menunggu' ORDER BY id_antrean ASC LIMIT 1").get(today);
  if (!next) return res.status(404).json({ pesan: 'Tidak ada antrean menunggu' });

  db.prepare("UPDATE antrean SET status_antrean = 'dipanggil', waktu_panggil = datetime('now','localtime') WHERE id_antrean = ?").run(next.id_antrean);

  const updated = db.prepare(
    `SELECT a.*, l.nama_layanan, l.kode_prefix,
     COALESCE(j.nama_jenis_layanan, '') as nama_jenis_layanan
     FROM antrean a JOIN layanan l ON a.id_layanan = l.id_layanan
     LEFT JOIN jenis_layanan j ON a.id_jenis_layanan = j.id_jenis_layanan
     WHERE a.id_antrean = ?`
  ).get(next.id_antrean);
  res.json(updated);
});

// PUT selesai
router.put('/:id/selesai', auth, (req, res) => {
  db.prepare("UPDATE antrean SET status_antrean = 'selesai', waktu_selesai = datetime('now','localtime') WHERE id_antrean = ?").run(req.params.id);
  res.json({ pesan: 'Antrean selesai dilayani' });
});

// PUT lewati
router.put('/:id/lewati', auth, (req, res) => {
  db.prepare("UPDATE antrean SET status_antrean = 'dilewati', waktu_selesai = datetime('now','localtime') WHERE id_antrean = ?").run(req.params.id);
  res.json({ pesan: 'Antrean dilewati' });
});

module.exports = router;
