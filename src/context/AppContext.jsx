// État global de l'application + toutes les actions de lecture/écriture.
// Les pages n'appellent JAMAIS db.js directement : elles passent par
// useApp(). Toute donnée écrite ici est immédiatement persistée en local.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as db from '../db.js';

const AppContext = createContext(null);

export const DEFAULT_SETTINGS = {
  id: 'company',
  name: '',
  logo: '',
  phone: '',
  email: '',
  ribBeneficiary: '',
  ribIban: '',
  ribBic: '',
};

const today = () => new Date().toISOString().slice(0, 10);

function upsert(list, item) {
  return list.some((x) => x.id === item.id)
    ? list.map((x) => (x.id === item.id ? item : x))
    : [...list, item];
}

export function AppProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Navigation (pas de router : simple état, voir MAINTENANCE.md)
  const [view, setView] = useState('dashboard');
  const [editingDocId, setEditingDocId] = useState(null);
  const [previewDocId, setPreviewDocId] = useState(null);
  const [newDocType, setNewDocType] = useState('devis');

  const reloadAll = useCallback(async () => {
    const [s, c, a, d] = await Promise.all([
      db.getOne('settings', 'company'),
      db.getAll('clients'),
      db.getAll('articles'),
      db.getAll('documents'),
    ]);
    setSettings(s || DEFAULT_SETTINGS);
    setClients(c || []);
    setArticles(a || []);
    setDocuments(d || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  // --- Paramètres entreprise (dont RIB : toujours modifiable) ---------
  const saveSettings = useCallback(async (next) => {
    const value = { ...DEFAULT_SETTINGS, ...next, id: 'company' };
    await db.putOne('settings', value);
    setSettings(value);
  }, []);

  // --- Clients ---------------------------------------------------------
  const saveClient = useCallback(async (client) => {
    const value = { ...client, id: client.id || crypto.randomUUID() };
    await db.putOne('clients', value);
    setClients((prev) => upsert(prev, value));
    return value;
  }, []);

  const deleteClient = useCallback(async (id) => {
    await db.deleteOne('clients', id);
    setClients((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // --- Articles (catalogue réutilisable) -------------------------------
  const saveArticle = useCallback(async (article) => {
    const value = { ...article, id: article.id || crypto.randomUUID() };
    await db.putOne('articles', value);
    setArticles((prev) => upsert(prev, value));
    return value;
  }, []);

  const deleteArticle = useCallback(async (id) => {
    await db.deleteOne('articles', id);
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // --- Documents (devis + factures) ------------------------------------
  const saveDocument = useCallback(async (docData) => {
    const value = {
      ...docData,
      id: docData.id || crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    };
    await db.putOne('documents', value);
    setDocuments((prev) => upsert(prev, value));
    return value;
  }, []);

  const deleteDocument = useCallback(async (id) => {
    await db.deleteOne('documents', id);
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  // Crée un document vide avec son numéro automatique (EST0001 / INV0001).
  const createNewDocument = useCallback(async (type = 'devis') => {
    const isInvoice = type === 'facture';
    const number = await db.nextNumber(isInvoice ? 'invoice' : 'estimate', isInvoice ? 'INV' : 'EST');
    const doc = {
      id: crypto.randomUUID(),
      type,
      number,
      date: today(),
      clientId: '',
      currency: 'EUR',
      exchangeRate: 1,
      lines: [],
      discount: 0,
      taxRate: 0,
      status: isInvoice ? 'unpaid' : 'draft',
      validityNote: isInvoice ? '' : 'Le devis est valide pendant une durée de 3 jours.',
      photos: [],
      signature: null,
      signedAt: null,
      payments: [],
      createdAt: new Date().toISOString(),
    };
    await db.putOne('documents', doc);
    setDocuments((prev) => [...prev, doc]);
    return doc;
  }, []);

  // Devis -> facture : copie lignes/client/montants, nouveau numéro INV.
  const convertToInvoice = useCallback(
    async (devisId) => {
      const source = documents.find((d) => d.id === devisId);
      if (!source) return null;
      const number = await db.nextNumber('invoice', 'INV');
      const invoice = {
        ...source,
        id: crypto.randomUUID(),
        type: 'facture',
        number,
        date: today(),
        status: 'unpaid',
        payments: [],
        signature: null,
        signedAt: null,
        convertedFromDevisId: source.id,
        createdAt: new Date().toISOString(),
      };
      await db.putOne('documents', invoice);
      setDocuments((prev) => [...prev, invoice]);
      return invoice;
    },
    [documents]
  );

  const value = {
    loading, settings, clients, articles, documents,
    saveSettings, saveClient, deleteClient,
    saveArticle, deleteArticle,
    saveDocument, deleteDocument, createNewDocument, convertToInvoice,
    view, setView, editingDocId, setEditingDocId,
    previewDocId, setPreviewDocId, newDocType, setNewDocType,
    reloadAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}
