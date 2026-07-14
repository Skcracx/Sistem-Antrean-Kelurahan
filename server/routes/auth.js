const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');
const auth = require('../middleware/auth');
const { SECRET } = require('../middleware/auth');

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ pesan: 'Username dan password wajib diisi' });
  }

  const user = db.prepare('SELECT * FROM pengguna WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ pesan: 'Username atau password salah' });
  }

  const token = jwt.sign(
    { id: user.id_pengguna, nama: user.nama, role: user.role },
    SECRET,
    { expiresIn: '8h' }
  );

  res.json({
    token,
    pengguna: { id: user.id_pengguna, nama: user.nama, role: user.role }
  });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id_pengguna, nama, username, role FROM pengguna WHERE id_pengguna = ?').get(req.pengguna.id);
  if (!user) return res.status(404).json({ pesan: 'Pengguna tidak ditemukan' });
  res.json(user);
});

module.exports = router;
