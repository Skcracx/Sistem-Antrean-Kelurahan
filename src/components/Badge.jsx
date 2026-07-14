import React from 'react';
import './Badge.css';

const variants = {
  menunggu: { cls: 'badge-warning', label: 'Menunggu' },
  dipanggil: { cls: 'badge-primary', label: 'Dipanggil' },
  selesai: { cls: 'badge-success', label: 'Selesai' },
  dilewati: { cls: 'badge-muted', label: 'Dilewati' },
};

export default function Badge({ status }) {
  const v = variants[status] || variants.menunggu;
  return <span className={`badge ${v.cls}`}>{v.label}</span>;
}
