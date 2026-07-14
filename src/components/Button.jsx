import React from 'react';
import './Button.css';

export default function Button({ children, variant = 'primary', size = 'md', onClick, disabled, className = '', type = 'button' }) {
  return (
    <button
      type={type}
      className={`btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
