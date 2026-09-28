import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

const EMPTY = {
  firstName: '',
  lastName: '',
  email: '',
  mobilePhone: '',
  landline: '',
  addresses: ['', '', ''], // jusqu'à 3 adresses
};

export default function Clients() {
  const { clients, saveClient, deleteClient } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  function openNew() {
    setForm(EMPTY);
    setShowForm(true);
  }

  function openEdit(client) {
    const addresses = [...(client.addresses || []), '', '', ''].slice(0, 3);
    setForm({ ...EMPTY, ...client, addresses });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.firstName.trim() && !form.lastName.trim()) {
      alert('Renseignez au moins un nom ou un prénom.');
      return;
    }
    await saveClient(form);
    setShowForm(false);
    setForm(EMPTY);
  }

  function handleDelete(c) {
    if (window.confirm(`Supprimer ${c.firstName} ${c.lastName} ?`)) deleteClient(c.id);
  }

  function updateAddress(idx, val) {
    const next = [...form.addresses];
    next[idx] = val;
    setForm({ ...form, addresses: next });
  }

  return (
    <section className="view active">
      <div className="pagehead">
        <div>
          <h1>Clients</h1>
          <p>Fiches réutilisables pour vos devis et factures</p>
        </div>
        <button className="btn" onClick={openNew}>+ Ajouter un client</button>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        {clients.length === 0 ? (
          <div className="empty">Aucun client enregistré pour l'instant.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Client</th><th>Email</th><th>Téléphone</th><th></th></tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr className="row" key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div className="avatar">
                        {((c.firstName || '')[0] || '') + ((c.lastName || '')[0] || '')}
                      </div>
                      {c.firstName} {c.lastName}
                    </div>
                  </td>
                  <td>{c.email}</td>
                  <td>{c.mobilePhone}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn ghost" onClick={() => openEdit(c)}>Modifier</button>{' '}
                    <button className="btn danger" onClick={() => handleDelete(c)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="card pad">
          <div className="section-title" style={{ marginTop: 0 }}>Fiche client</div>
          <div className="grid2">
            <div className="field">
              <label>Nom</label>
              <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </div>
            <div className="field">
              <label>Prénom</label>
              <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label>Adresse email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div className="hint">Utilisée pour l'envoi du devis / de la facture</div>
            </div>
            <div className="field">
              <label>Téléphone (avec indicatif)</label>
              <input
                value={form.mobilePhone}
                placeholder="+590 6 90 60 14 63"
                onChange={(e) => setForm({ ...form, mobilePhone: e.target.value })}
              />
            </div>
          </div>
          <div className="field" style={{ maxWidth: 340 }}>
            <label>Téléphone fixe</label>
            <input value={form.landline} onChange={(e) => setForm({ ...form, landline: e.target.value })} />
          </div>

          <div className="section-title">Adresses <span className="mini">(jusqu'à 3)</span></div>
          {form.addresses.map((addr, idx) => (
            <div className="addr-block" key={idx}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Adresse {idx + 1}</label>
                <input
                  value={addr}
                  placeholder={idx === 0 ? '' : 'Optionnel'}
                  onChange={(e) => updateAddress(idx, e.target.value)}
                />
              </div>
            </div>
          ))}

          <div className="note">
            ✎ Cette fiche est enregistrée dans votre carnet de clients et sera proposée automatiquement lors de vos prochains devis et factures.
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
            <button className="btn" onClick={handleSave}>Enregistrer le client</button>
            <button className="btn ghost" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}
