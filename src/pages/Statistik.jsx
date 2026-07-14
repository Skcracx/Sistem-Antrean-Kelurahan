import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import './Statistik.css';

function formatTanggal(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

function getMonthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0=Sun
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export default function Statistik() {
  const { authHeader } = useAuth();
  const [tanggal, setTanggal] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [stats, setStats] = useState(null);
  const [calMonth, setCalMonth] = useState(() => new Date());
  const [monthData, setMonthData] = useState([]);

  useEffect(() => {
    axios.get(`/api/statistik?tanggal=${tanggal}`, authHeader()).then(r => setStats(r.data)).catch(() => {});
  }, [tanggal]);

  useEffect(() => {
    const key = getMonthKey(calMonth);
    axios.get(`/api/statistik/bulanan?bulan=${key}`, authHeader()).then(r => setMonthData(r.data)).catch(() => {});
  }, [calMonth]);

  const year = calMonth.getFullYear();
  const month = calMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const todayStr = new Date().toISOString().slice(0, 10);

  const prevMonth = () => setCalMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCalMonth(new Date(year, month + 1, 1));

  const dayDataMap = {};
  monthData.forEach(d => { dayDataMap[d.tanggal] = d; });

  const total = stats?.total || 1;

  return (
    <div className="statistik-page">
      <h1 className="text-headline-lg" style={{ marginBottom: 8 }}>Statistik Antrean</h1>
      <p className="text-body-md text-muted" style={{ marginBottom: 32 }}>
        {formatTanggal(tanggal)}
      </p>

      <div className="stat-layout">
        {/* Calendar */}
        <div className="calendar-card">
          <div className="cal-header">
            <button className="cal-nav" onClick={prevMonth}>‹</button>
            <span className="cal-title">
              {calMonth.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </span>
            <button className="cal-nav" onClick={nextMonth}>›</button>
          </div>
          <div className="cal-grid">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map(d => (
              <div key={d} className="cal-day-label">{d}</div>
            ))}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} className="cal-cell empty"></div>)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = toDateStr(year, month, day);
              const data = dayDataMap[dateStr];
              const isSelected = dateStr === tanggal;
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={day}
                  className={`cal-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${data ? 'has-data' : ''}`}
                  onClick={() => setTanggal(dateStr)}
                >
                  <span className="cal-day-num">{day}</span>
                  {data && <span className="cal-day-count">{data.total}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stats detail */}
        <div className="stat-detail">
          {stats ? (
            <>
              <div className="stats-overview-sm">
                <StatCard label="Total" value={stats.total} icon="📋" color="primary" />
                <StatCard label="Menunggu" value={stats.menunggu} icon="⏳" color="warning" />
                <StatCard label="Dipanggil" value={stats.dipanggil} icon="📢" color="primary" />
                <StatCard label="Selesai" value={stats.selesai} icon="✅" color="success" />
                <StatCard label="Dilewati" value={stats.dilewati} icon="⏭️" color="muted" />
              </div>

              <div className="stats-card">
                <h2 className="text-title-md" style={{ marginBottom: 20 }}>Progress</h2>
                <div className="progress-bar">
                  <div className="progress-fill fill-success" style={{ width: `${(stats.selesai / total) * 100}%` }}></div>
                  <div className="progress-fill fill-primary" style={{ width: `${(stats.dipanggil / total) * 100}%` }}></div>
                  <div className="progress-fill fill-warning" style={{ width: `${(stats.menunggu / total) * 100}%` }}></div>
                  <div className="progress-fill fill-muted" style={{ width: `${(stats.dilewati / total) * 100}%` }}></div>
                </div>
                <div className="progress-legend">
                  <span className="legend-item"><span className="legend-dot success"></span>Selesai ({stats.selesai})</span>
                  <span className="legend-item"><span className="legend-dot primary"></span>Dipanggil ({stats.dipanggil})</span>
                  <span className="legend-item"><span className="legend-dot warning"></span>Menunggu ({stats.menunggu})</span>
                  <span className="legend-item"><span className="legend-dot muted"></span>Dilewati ({stats.dilewati})</span>
                </div>
              </div>

              <div className="stats-card">
                <h2 className="text-title-md" style={{ marginBottom: 20 }}>Per Kategori</h2>
                {stats.per_layanan.length === 0 ? (
                  <p className="text-body-sm text-muted">Belum ada data untuk tanggal ini</p>
                ) : (
                  <div className="service-bars">
                    {stats.per_layanan.map((item, i) => (
                      <div key={i} className="service-bar-item">
                        <div className="service-bar-label">
                          <span className="text-body-md"><span className="bar-prefix">{item.kode_prefix}</span>{item.nama_layanan}</span>
                          <span className="text-body-md fw-700">{item.jumlah}</span>
                        </div>
                        <div className="service-bar-track">
                          <div className="service-bar-fill" style={{ width: `${(item.jumlah / total) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-body-md text-muted">Memuat statistik...</p>
          )}
        </div>
      </div>
    </div>
  );
}
