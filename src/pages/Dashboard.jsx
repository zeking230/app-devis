import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { computeDocumentTotals, formatMoney } from '../utils/calculations.js';

export default function Dashboard() {
  const { documents, clients, setView, setEditingDocId, setPreviewDocId, deleteDocument } = useApp();

  const pendingQuotes = documents.filter(
    (d) => d.type === 'devis' && ['draft', 'sent'].includes(d.status)
  ).length;
  const paidTotal = documents
    .filter((d) => d.type === 'facture')
    .reduce((sum, d) => sum + computeDocumentTotals(d).paid, 0);
  const partial = documents.filter((d) => d.type === 'facture' && d.status === 'partial').length;
  const expired = documents.filter((d) => d.status === 'expired').length;

  function clientName(id) {
    const c = clients.find((x) => x.id === id);
    return c ? `${c.firstName} ${c.lastName}` : '—';
  }

  function openPreview(doc) {
    setPreviewDocId(doc.id);
    setView('preview');
  }

  function openEdit(doc) {
    setEditingDocId(doc.id);
    setView('editor');
  }

  function handleDelete(doc) {
    if (window.confirm(`Supprimer ${doc.number} ?`)) deleteDocument(doc.id);
  }

  return (
    <section className="view active">
      <div className="pagehead">
        <div>
          <h1>Tableau de bord</h1>
          <p>Vue d'ensemble des devis et factures</p>
        </div>
        <button
          className="btn"
          onClick={() => {
            setEditingDocId(null);
            setView('editor');
          }}
        >
          + Nouveau document
        </button>
      </div>

      <div className="stats">
        <div className="stat"><div className="n">{pendingQuotes}</div><div className="l">Devis en attente</div></div>
        <div className="stat"><div className="n">{formatMoney(paidTotal)}</div><div className="l">Encaissé</div></div>
        <div className="stat"><div className="n">{partial}</div><div className="l">Paiement partiel</div></div>
        <div className="stat"><div className="n">{expired}</div><div className="l">Devis expiré</div></div>
      </div>

      <div className="card">
        {documents.length === 0 ? (
          <div className="empty">Aucun document pour l'instant. Créez votre premier devis.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Réf.</th><th>Client</th><th>Type</th><th>Montant</th><th>Statut</th><th></th></tr>
            </thead>
            <tbody>
              {documents
                .slice()
                .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
                .map((doc) => (
                  <tr className="row" key={doc.id}>
                    <td>{doc.number}</td>
                    <td>{clientName(doc.clientId)}</td>
                    <td>{doc.type === 'devis' ? 'Devis' : 'Facture'}</td>
                    <td>{formatMoney(computeDocumentTotals(doc).total, doc.currency)}</td>
                    <td><StatusBadge status={doc.status} /></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="btn ghost" onClick={() => openPreview(doc)}>Aperçu</button>{' '}
                      <button className="btn ghost" onClick={() => openEdit(doc)}>Modifier</button>{' '}
                      <button className="btn danger" onClick={() => handleDelete(doc)}>Supprimer</button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}
