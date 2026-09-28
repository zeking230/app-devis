import React from 'react';

export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="switch-row" style={{ cursor: 'pointer' }}>
      {label && <span className="lbl">{label}</span>}
      <span className="switch">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="slider"></span>
      </span>
    </label>
  );
}
