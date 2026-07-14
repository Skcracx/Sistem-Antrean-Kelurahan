const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'kelurahan-rahasia-2024';

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ pesan: 'Token tidak ditemukan' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ pesan: 'Format token salah' });

  try {
    req.pengguna = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ pesan: 'Token tidak valid atau kedaluwarsa' });
  }
};

module.exports.SECRET = SECRET;
