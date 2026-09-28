// Calculs de montants. Toute la logique financière est centralisée ici :
// ne jamais recalculer un total ailleurs (voir MAINTENANCE.md).

export function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

// Total d'une ligne : quantité x coût unitaire, moins remise de ligne.
export function computeLineTotal(line) {
  const qty = Number(line.quantity) || 0;
  const unitCost = Number(line.unitCost) || 0;
  let total = qty * unitCost;
  const discountValue = Number(line.discountValue) || 0;
  if (line.discountType === 'percent') {
    total -= total * (discountValue / 100);
  } else if (line.discountType === 'fixed') {
    total -= discountValue;
  }
  return Math.max(0, round2(total));
}

// Totaux d'un document (devis ou facture).
export function computeDocumentTotals(doc) {
  const lines = doc.lines || [];
  const subtotal = round2(lines.reduce((sum, l) => sum + computeLineTotal(l), 0));
  const discount = Number(doc.discount) || 0;
  const taxRate = Number(doc.taxRate) || 0;
  const afterDiscount = Math.max(0, subtotal - discount);
  // La taxe ne s'applique qu'aux lignes "sujettes à taxe" (taxable !== false),
  // la remise globale étant répartie au prorata.
  const taxableSubtotal = round2(
    lines.filter((l) => l.taxable !== false).reduce((sum, l) => sum + computeLineTotal(l), 0)
  );
  const taxableAfterDiscount = subtotal > 0 ? afterDiscount * (taxableSubtotal / subtotal) : 0;
  const taxAmount = round2(taxableAfterDiscount * (taxRate / 100));
  const total = round2(afterDiscount + taxAmount);
  const paid = round2((doc.payments || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0));
  const balanceDue = round2(total - paid);
  return { subtotal, discount, taxAmount, total, paid, balanceDue };
}

const SYMBOLS = { EUR: '€', USD: '$', OTHER: '' };

export function formatMoney(amount, currency = 'EUR') {
  const symbol = SYMBOLS[currency] ?? currency;
  return `${Number(amount).toFixed(2).replace('.', ',')} ${symbol}`.trim();
}
