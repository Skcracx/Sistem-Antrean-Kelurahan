import React from 'react';
import './Input.css';

export default function Input({ label, placeholder, value, onChange, type = 'text', id, required, error }) {
  return (
    <div className="input-group">
      {label && <label htmlFor={id} className="input-label">{label}{required && <span className="input-required">*</span>}</label>}
      <input id={id} type={type} className={`input-field ${error ? 'input-error' : ''}`} placeholder={placeholder} value={value} onChange={onChange} required={required} />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
}
