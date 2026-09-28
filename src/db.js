// Couche unique d'accès aux données locales (IndexedDB via la lib "idb").
// Aucune donnée ne quitte le navigateur ici — voir MAINTENANCE.md pour
// le détail de l'architecture "100% local".

import { openDB } from 'idb';

const DB_NAME = 'devis-facture-db';
const DB_VERSION = 1;

let dbPromise;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('clients')) {
          db.createObjectStore('clients', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('articles')) {
          db.createObjectStore('articles', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('documents')) {
          db.createObjectStore('documents', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('counters')) {
          db.createObjectStore('counters', { keyPath: 'name' });
        }
      },
    });
  }
  return dbPromise;
}

// --- Helpers génériques CRUD ------------------------------------------

export async function getAll(store) {
  const db = await getDB();
  return db.getAll(store);
}

export async function getOne(store, id) {
  const db = await getDB();
  return db.get(store, id);
}

export async function putOne(store, value) {
  const db = await getDB();
  await db.put(store, value);
  return value;
}

export async function deleteOne(store, id) {
  const db = await getDB();
  await db.delete(store, id);
}

// --- Numérotation automatique (devis / factures) -----------------------
// Un compteur par type de document, stocké dans le store "counters".
// Voir MAINTENANCE.md > "Numérotation" pour la règle de non-régression
// légale (ne jamais réattribuer un numéro déjà utilisé).

export async function nextNumber(counterName, prefix) {
  const db = await getDB();
  const tx = db.transaction('counters', 'readwrite');
  const store = tx.objectStore('counters');
  let counter = await store.get(counterName);
  if (!counter) counter = { name: counterName, value: 0 };
  counter.value += 1;
  await store.put(counter);
  await tx.done;
  const padded = String(counter.value).padStart(4, '0');
  return `${prefix}${padded}`;
}

// --- Export / import complet (sauvegarde) -------------------------------

export async function exportAllData() {
  const db = await getDB();
  const [settings, clients, articles, documents, counters] = await Promise.all([
    db.getAll('settings'),
    db.getAll('clients'),
    db.getAll('articles'),
    db.getAll('documents'),
    db.getAll('counters'),
  ]);
  return {
    settings,
    clients,
    articles,
    documents,
    counters,
    exportedAt: new Date().toISOString(),
  };
}

export async function importAllData(data) {
  const db = await getDB();
  const stores = ['settings', 'clients', 'articles', 'documents', 'counters'];
  const tx = db.transaction(stores, 'readwrite');
  for (const storeName of stores) {
    if (Array.isArray(data[storeName])) {
      for (const item of data[storeName]) {
        await tx.objectStore(storeName).put(item);
      }
    }
  }
  await tx.done;
}
