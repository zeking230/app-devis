import React, { useRef, useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { computeDocumentTotals, computeLineTotal, formatMoney } from '../utils/calculations.js';
import { exportNodeToPdf } from '../utils/pdfExport.js';
import { buildMailtoLink, PAYMENT_REQUEST_TEXT } from '../utils/email.js';

// Aperçu = exactement ce qui sera capturé en PDF (le noeud `ref`).
// Le RIB affiché est TOUJOURS celui des paramètres actuels (jamais figé).
export default function DocumentPreview() {
  const { documents, clients, settings, previewDocId, setView, setEditingDocId } = useApp();
  const ref = useRef(null);
  const [busy, setBusy] = useState(false);

  const doc = documents.find((d) => d.id === previewDocId);
  if (!doc) {
    return (
      <section className="view active">
        <div className="empty">Aucun document sélectionné.</div>
      </section>
    );
  }

  const client = clients.find((c) => c.id === doc.clientId);
  const totals = computeDocumentTotals(doc);
  const isDevis = doc.type === 'devis';
  const cur = doc.currency;

  async function handleExportPdf() {
    setBusy(true);
    try {
      await exportNodeToPdf(ref.current, `${doc.number}.pdf`);
    } finally {
      setBusy(false);
    }
  }

  function handleEmail() {
    if (!client?.email) {
      alert("Ajoutez d'abord l'email du client sur sa fiche.");
      return;
    }
    const label = isDevis ? 'devis' : 'facture';
    const subject = `${isDevis ? 'Devis' : 'Facture'} ${doc.number} — ${settings.name || ''}`;
    const body =
      `Bonjour ${client.firstName},\n\nVeuillez trouver ci-joint votre ${label} ${doc.number}.\n` +
      (isDevis
        ? `Merci de le signer et de nous le renvoyer par retour d'email.\n`
        : `${PAYMENT_REQUEST_TEXT}\n`) +
      `\nCordialement,\n${settings.name || ''}`;
    window.location.href = buildMailtoLink({ to: client.email, subject, body });
  }

  return (
    <section className="view active">
      <div className="pagehead">
        <div>
          <h1>Aperçu du document</h1>
          <p>Ce que le client recevra en pièce jointe</p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn ghost" onClick={() => { setEditingDocId(doc.id); setView('editor'); }}>Modifier</button>
          <button className="btn ghost" onClick={handleExportPdf} disabled={busy}>
            {busy ? 'Génération…' : 'Télécharger PDF'}
          </button>
          <button className="btn" onClick={handleEmail}>Envoyer par email</button>
        </div>
      </div>
      <div className="note" style={{ marginBottom: 14 }}>
        ✎ « Envoyer par email » ouvre votre messagerie. Téléchargez d'abord le PDF et joignez-le au message.
      </div>

      <div className="docprev" ref={ref}>
        <div className="dhead">
          <div>
            {settings.logo ? (
              <img src={settings.logo} alt="logo" className="doc-logo" />
            ) : (
              <div className="logo">{(settings.name || 'ME').slice(0, 2).toUpperCase()}</div>
            )}
            <b>{settings.name}</b>
            <br />
            <span className="mini">{[settings.phone, settings.email].filter(Boolean).join(' · ')}</span>
          </div>
          <div className="meta">
            <b>{isDevis ? 'DEVIS' : 'FACTURE'}</b>
            <br />{doc.number}
            <br /><br />DATE<br />{doc.date}
            <br /><br /><StatusBadge status={doc.status} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <span className="mini">{isDevis ? 'DEVIS POUR' : 'FACTURÉ À'}</span>
          <br />
          {client ? (
            <>
              <b>{client.firstName} {client.lastName}</b>
              <br />
              <span className="mini">
                {(client.addresses || []).filter(Boolean).map((a, i) => (<span key={i}>{a}<br /></span>))}
                {client.mobilePhone}
                {client.email && (<><br />{client.email}</>)}
              </span>
            </>
          ) : (
            <span className="mini">Aucun client sélectionné</span>
          )}
        </div>

        <table>
          <thead>
            <tr><th>Article</th><th>Prix</th><th>Qté</th><th>Montant</th></tr>
          </thead>
          <tbody>
            {doc.lines.map((l) => (
              <tr key={l.id}>
                <td>{l.description}</td>
                <td>{formatMoney(l.unitCost, cur)}</td>
                <td>{l.quantity}</td>
                <td>{formatMoney(computeLineTotal(l), cur)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 240 }}>
            <div className="trow"><span>Sous-total</span><span>{formatMoney(totals.subtotal, cur)}</span></div>
            {totals.discount > 0 && <div className="trow"><span>Remise</span><span>-{formatMoney(totals.discount, cur)}</span></div>}
            {totals.taxAmount > 0 && <div className="trow"><span>Taxe</span><span>{formatMoney(totals.taxAmount, cur)}</span></div>}
            <div className="trow grand"><span>Total</span><span>{formatMoney(totals.total, cur)}</span></div>
            {!isDevis && (
              <>
                <div className="trow"><span>Payé</span><span>-{formatMoney(totals.paid, cur)}</span></div>
                <div className="trow grand"><span>Solde dû</span><span>{formatMoney(totals.balanceDue, cur)}</span></div>
              </>
            )}
          </div>
        </div>

        {isDevis && doc.validityNote && <p className="mini" style={{ marginTop: 12 }}>{doc.validityNote}</p>}

        {(settings.ribIban || settings.ribBeneficiary) && (
          <div className="rib-box" style={{ marginTop: 14 }}>
            <b className="mini">INSTRUCTIONS DE PAIEMENT (VIREMENT)</b>
            <br />
            {settings.ribBeneficiary && <>Bénéficiaire : {settings.ribBeneficiary}<br /></>}
            {settings.ribIban && <>IBAN : {settings.ribIban}<br /></>}
            {settings.ribBic && <>BIC : {settings.ribBic}</>}
            {!isDevis && <div className="mini" style={{ marginTop: 6 }}>{PAYMENT_REQUEST_TEXT}</div>}
          </div>
        )}

        {(doc.photos || []).length > 0 && (
          <div className="photo-row" style={{ marginTop: 14 }}>
            {doc.photos.map((src, i) => (<img key={i} src={src} alt="" className="doc-photo" />))}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <span className="mini">SIGNATURE {doc.signedAt ? `— ${doc.signedAt}` : ''}</span>
          {doc.signature ? (
            <div><img src={doc.signature} alt="signature" style={{ height: 70 }} /></div>
          ) : (
            <div className="sig-canvas" style={{ height: 60 }}>Espace réservé à la signature du client</div>
          )}
        </div>
      </div>
    </section>
  );
}
