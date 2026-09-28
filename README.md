# Devis & Factures — app locale

Web app de création de devis et factures. **100% locale** : toutes les
données restent dans le navigateur (IndexedDB). Aucun serveur, aucune base
de données externe, un seul utilisateur.

## Fonctionnalités

- Profil entreprise (nom, logo, téléphone, email) + **RIB modifiable à tout moment**
- Clients réutilisables (nom, prénom, 3 adresses, email, mobile avec indicatif, fixe)
- Catalogue d'articles réutilisables (unité, remise, taxe, détails…)
- Devis avec numérotation automatique (`EST0001`…) et statuts manuels
- Conversion devis → facture (`INV0001`…)
- Paiements partiels (virement), solde dû, statut payée / partielle / non payée
- Multi-devise (taux saisi manuellement)
- Signature dessinée, ajout de photos
- Export PDF (logo, infos client, statut payé/non payé, RIB, signature)
- Sauvegarde : export / import JSON

## Installation

Prérequis : [Node.js](https://nodejs.org) 18 ou plus récent.

```bash
npm install
npm run dev      # développement -> http://localhost:5173
npm run build    # version de production dans /dist
npm run preview  # tester la version de production
```

## Première utilisation

1. Onglet **Entreprise** : nom, logo, téléphone, email, RIB -> Enregistrer.
2. Onglet **Clients** : ajoutez un client.
3. Onglet **Nouveau document** : créez un devis, ajoutez des articles, « Aperçu PDF ».
4. « Télécharger PDF », puis « Envoyer par email » (ouvre votre messagerie : joignez le PDF).

## Limites connues (V1)

- Les données sont liées à **ce navigateur sur cet appareil**. Exportez
  régulièrement une sauvegarde JSON (onglet Entreprise).
- L'envoi d'email utilise `mailto:` : il n'attache pas le PDF automatiquement.
  L'envoi automatique avec pièce jointe nécessite un petit relai serverless :
  voir `MAINTENANCE.md`, section « Passer à l'envoi automatique ».
- Pas de suivi automatique : les statuts se changent à la main.
- La signature du client se fait hors app (il signe le PDF reçu et le renvoie).

## Documentation technique

Voir **MAINTENANCE.md** pour comprendre l'architecture et modifier le code.
