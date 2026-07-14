const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const db = new Database(path.join(__dirname, 'kelurahan.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS pengguna (
    id_pengguna INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'petugas'
  );

  CREATE TABLE IF NOT EXISTS layanan (
    id_layanan INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_layanan TEXT NOT NULL,
    deskripsi TEXT DEFAULT '',
    kode_prefix TEXT NOT NULL DEFAULT '',
    aktif INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS jenis_layanan (
    id_jenis_layanan INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_jenis_layanan TEXT NOT NULL,
    id_layanan INTEGER NOT NULL,
    aktif INTEGER DEFAULT 1,
    FOREIGN KEY (id_layanan) REFERENCES layanan(id_layanan)
  );

  CREATE TABLE IF NOT EXISTS antrean (
    id_antrean INTEGER PRIMARY KEY AUTOINCREMENT,
    kode_unik TEXT UNIQUE NOT NULL,
    nomor_antrean TEXT NOT NULL,
    nama_warga TEXT DEFAULT '',
    status_antrean TEXT NOT NULL DEFAULT 'menunggu',
    waktu_daftar DATETIME DEFAULT (datetime('now','localtime')),
    waktu_panggil DATETIME,
    waktu_selesai DATETIME,
    id_layanan INTEGER NOT NULL,
    id_jenis_layanan INTEGER,
    sumber TEXT DEFAULT 'manual',
    FOREIGN KEY (id_layanan) REFERENCES layanan(id_layanan),
    FOREIGN KEY (id_jenis_layanan) REFERENCES jenis_layanan(id_jenis_layanan)
  );
`);

// Seed default admin
const admin = db.prepare('SELECT * FROM pengguna WHERE username = ?').get('admin');
if (!admin) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO pengguna (nama, username, password, role) VALUES (?, ?, ?, ?)').run('Administrator', 'admin', hash, 'petugas');
  console.log('Default admin created: admin / admin123');
}

// Seed kategori layanan with prefix codes
const count = db.prepare('SELECT COUNT(*) as c FROM layanan').get();
if (count.c === 0) {
  const insertKat = db.prepare('INSERT INTO layanan (nama_layanan, deskripsi, kode_prefix) VALUES (?, ?, ?)');
  const insertJenis = db.prepare('INSERT INTO jenis_layanan (nama_jenis_layanan, id_layanan) VALUES (?, ?)');

  const r1 = insertKat.run('Administrasi', 'Legalisasi dokumen, pengantar RT/RW, dan layanan administratif umum', 'A');
  insertJenis.run('Legalisasi Dokumen', r1.lastInsertRowid);
  insertJenis.run('Pengantar RT/RW', r1.lastInsertRowid);
  insertJenis.run('Surat Pernyataan', r1.lastInsertRowid);

  const r2 = insertKat.run('Pencatatan Sipil', 'Pembuatan akta kelahiran, akta kematian, dan pencatatan perubahan data', 'P');
  insertJenis.run('Akta Kelahiran', r2.lastInsertRowid);
  insertJenis.run('Akta Kematian', r2.lastInsertRowid);
  insertJenis.run('Perubahan Data Kependudukan', r2.lastInsertRowid);

  const r3 = insertKat.run('Surat Keterangan', 'Surat keterangan domisili, SKTM, surat pengantar, dan surat keterangan lainnya', 'SK');
  insertJenis.run('Surat Keterangan Domisili', r3.lastInsertRowid);
  insertJenis.run('Surat Keterangan Tidak Mampu (SKTM)', r3.lastInsertRowid);
  insertJenis.run('Surat Pengantar', r3.lastInsertRowid);

  const r4 = insertKat.run('Layanan Sosial', 'Pendaftaran bantuan sosial, Program PKH, dan layanan kesejahteraan masyarakat', 'L');
  insertJenis.run('Pendaftaran Bantuan Sosial', r4.lastInsertRowid);
  insertJenis.run('Program PKH', r4.lastInsertRowid);
  insertJenis.run('Layanan Kesejahteraan', r4.lastInsertRowid);

  console.log('Default kategori & jenis layanan seeded');
}

module.exports = db;
