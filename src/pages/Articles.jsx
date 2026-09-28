import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import Toggle from '../components/Toggle.jsx';
import { computeLineTotal, formatMoney } from '../utils/calculations.js';

export const UNIT_LABELS = { unite: 'Unité', heures: 'Heures', jours: 'Jours', forfait: 'Forfait', km: 'Km' };

const EMPTY = {
  description: '',
  unitCost: 0,
  unit: 'unite',
  quantity: 1,
  discountType: 'none', // none | percent | fixed
  discountValue: 0,
  taxable: true,
  notes: '',
};

export default function Articles() {
  const { articles, saveArticle, deleteArticle } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);

  function openNew() {
    setForm(EMPTY);
    setShowForm(true);
  }
  function openEdit(article) {
    setForm({ ...EMPTY, ...article });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.description.trim()) {
      alert('La description est obligatoire.');
      return;
    }
    await saveArticle(form);
    setShowForm(false);
    setForm(EMPTY);
  }

  function handleDelete(a) {
    if (window.confirm(`Supprimer « ${a.description} » du catalogue ?`)) deleteArticle(a.id);
  }

  const total = computeLineTotal(form);

  return (
    <section className="view active">
      <div className="pagehead">
        <div>
          <h1>Mes articles</h1>
          <p>Catalogue de produits et prestations réutilisables</p>
        </div>
        <button className="btn" onClick={openNew}>+ Ajouter un article</button>
      </div>

      <div className="card" style={{ marginBottom: 18 }}>
        {articles.length === 0 ? (
          <div className="empty">Aucun article enregistré pour l'instant.</div>
        ) : (
          <table>
            <thead>
              <tr><th>Article</th><th>Coût unitaire</th><th>Unité</th><th>Taxe</th><th></th></tr>
            </thead>
            <tbody>
              {articles.map((a) => (
                <tr className="row" key={a.id}>
                  <td>
                    {a.description}
                    {a.notes && (<><br /><span className="mini">{a.notes}</span></>)}
                  </td>
                  <td>{formatMoney(a.unitCost)}</td>
                  <td>{UNIT_LABELS[a.unit] || a.unit}</td>
                  <td>{a.taxable ? 'Oui' : 'Non'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="btn ghost" onClick={() => openEdit(a)}>Modifier</button>{' '}
                    <button className="btn danger" onClick={() => handleDelete(a)}>Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="card pad" style={{ maxWidth: 520 }}>
          <div className="section-title" style={{ marginTop: 0 }}>Article</div>
          <div className="field">
            <label>Description</label>
            <textarea
              value={form.description}
              placeholder="Ex. vanne EGR d'occasion"
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid2">
            <div className="field">
              <label>Coût unitaire</label>
              <input type="number" step="0.01" value={form.unitCost} onChange={(e) => setForm({ ...form, unitCost: e.target.value })} />
            </div>
            <div className="field">
              <label>Unité</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
                {Object.entries(UNIT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid2">
            <div className="field">
              <label>Quantité</label>
              <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            </div>
            <div className="field">
              <label>Remise</label>
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                <option value="none">Aucune</option>
                <option value="percent">Pourcentage (%)</option>
                <option value="fixed">Montant fixe</option>
              </select>
            </div>
          </div>
          {form.discountType !== 'none' && (
            <div className="field" style={{ maxWidth: 200 }}>
              <label>Montant de la remise</label>
              <input type="number" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} />
            </div>
          )}

          <Toggle label="Sujet à taxe" checked={form.taxable} onChange={(v) => setForm({ ...form, taxable: v })} />

          <div className="field">
            <label>Total</label>
            <div className="total-display">{formatMoney(total)}</div>
          </div>
          <div className="field">
            <label>Autres détails</label>
            <textarea
              value={form.notes}
              placeholder="Notes internes, référence pièce, garantie…"
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="note">✎ Cet article reste disponible pour être réutilisé tel quel dans vos prochains devis et factures.</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <button className="btn" onClick={handleSave}>Enregistrer l'article</button>
            <button className="btn ghost" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </div>
      )}
    </section>
  );
}
