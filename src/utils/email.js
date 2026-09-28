// Envoi d'email — V1 : ouverture du client mail de l'utilisateur (mailto:).
// Limite : mailto ne peut PAS joindre le PDF automatiquement. L'utilisateur
// télécharge le PDF puis l'attache manuellement.
//
// Pour un envoi automatique avec pièce jointe (V2), il faut un relai
// serverless + service transactionnel (Resend/Postmark…) : voir
// MAINTENANCE.md > "Passer à l'envoi automatique".
// C'est le SEUL fichier à modifier pour brancher ce relai.

export function buildMailtoLink({ to, subject, body }) {
  const params = new URLSearchParams({ subject, body });
  // URLSearchParams encode les espaces en "+", mailto attend "%20".
  return `mailto:${to}?${params.toString().replace(/\+/g, '%20')}`;
}

export const PAYMENT_REQUEST_TEXT =
  "Merci d'effectuer le virement selon le RIB indiqué sur le document, puis de nous renvoyer une capture d'écran de la confirmation à cette adresse email.";
