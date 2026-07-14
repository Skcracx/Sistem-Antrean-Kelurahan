const router = require('express').Router();
const db = require('../database');
const auth = require('../middleware/auth');

function hariIni() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getStatsForDate(tanggal) {
  const total = db.prepare("SELECT COUNT(*) as jumlah FROM antrean WHERE date(waktu_daftar) = ?").get(tanggal);
  const menunggu = db.prepare("SELECT COUNT(*) as jumlah FROM antrean WHERE date(waktu_daftar) = ? AND status_antrean = 'menunggu'").get(tanggal);
  const dipanggil = db.prepare("SELECT COUNT(*) as jumlah FROM antrean WHERE date(waktu_daftar) = ? AND status_antrean = 'dipanggil'").get(tanggal);
  const selesai = db.prepare("SELECT COUNT(*) as jumlah FROM antrean WHERE date(waktu_daftar) = ? AND status_antrean = 'selesai'").get(tanggal);
  const dilewati = db.prepare("SELECT COUNT(*) as jumlah FROM antrean WHERE date(waktu_daftar) = ? AND status_antrean = 'dilewati'").get(tanggal);

  const perLayanan = db.prepare(`
    SELECT l.nama_layanan, l.kode_prefix, COUNT(a.id_antrean) as jumlah
    FROM antrean a JOIN layanan l ON a.id_layanan = l.id_layanan
    WHERE date(a.waktu_daftar) = ? GROUP BY l.nama_layanan
  `).all(tanggal);

  return {
    tanggal,
    total: total.jumlah,
    menunggu: menunggu.jumlah,
    dipanggil: dipanggil.jumlah,
    selesai: selesai.jumlah,
    dilewati: dilewati.jumlah,
    per_layanan: perLayanan
  };
}

// GET stats - supports ?tanggal=YYYY-MM-DD query param
router.get('/', auth, (req, res) => {
  const tanggal = req.query.tanggal || hariIni();
  res.json(getStatsForDate(tanggal));
});

// GET monthly summary - for calendar view
router.get('/bulanan', auth, (req, res) => {
  const bulan = req.query.bulan || hariIni().substring(0, 7); // YYYY-MM
  const daily = db.prepare(`
    SELECT date(waktu_daftar) as tanggal, COUNT(*) as total,
    SUM(CASE WHEN status_antrean = 'selesai' THEN 1 ELSE 0 END) as selesai
    FROM antrean
    WHERE strftime('%Y-%m', waktu_daftar) = ?
    GROUP BY date(waktu_daftar) ORDER BY tanggal
  `).all(bulan);
  res.json(daily);
});

module.exports = router;
