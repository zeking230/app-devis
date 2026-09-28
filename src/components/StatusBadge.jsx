import React from 'react';

// [libellé, classe CSS]
const LABELS = {
  draft: ['Brouillon', 'b-draft'],
  sent: ['Envoyé', 'b-sent'],
  signed: ['Signé', 'b-signed'],
  refused: ['Refusé', 'b-expired'],
  expired: ['Expiré', 'b-expired'],
  unpaid: ['Non payée', 'b-sent'],
  partial: ['Partielle', 'b-partial'],
  paid: ['Payée', 'b-paid'],
};

export default function StatusBadge({ status }) {
  const [label, cls] = LABELS[status] || [status, 'b-draft'];
  return <span className={`badge ${cls}`}>{label}</span>;
}
