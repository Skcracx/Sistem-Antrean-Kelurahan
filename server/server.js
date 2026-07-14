const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize database (creates tables & seeds)
require('./database');

const authRoutes = require('./routes/auth');
const layananRoutes = require('./routes/layanan');
const antreanRoutes = require('./routes/antrean');
const statistikRoutes = require('./routes/statistik');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/layanan', layananRoutes);
app.use('/api/antrean', antreanRoutes);
app.use('/api/statistik', statistikRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', waktu: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server Kelurahan berjalan di http://localhost:${PORT}`);
});
