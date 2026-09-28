import React from 'react';
import { useApp } from './context/AppContext.jsx';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Clients from './pages/Clients.jsx';
import Articles from './pages/Articles.jsx';
import DocumentEditor from './pages/DocumentEditor.jsx';
import DocumentPreview from './pages/DocumentPreview.jsx';
import Settings from './pages/Settings.jsx';

// Navigation par simple état (`view`) : pas de react-router.
// Pour ajouter une page : créer le composant, l'ajouter ici et dans Sidebar.
export default function App() {
  const { loading, view } = useApp();

  if (loading) return <div className="loading-screen">Chargement…</div>;

  return (
    <div className="app">
      <Sidebar />
      <main>
        {view === 'dashboard' && <Dashboard />}
        {view === 'clients' && <Clients />}
        {view === 'articles' && <Articles />}
        {view === 'editor' && <DocumentEditor />}
        {view === 'preview' && <DocumentPreview />}
        {view === 'settings' && <Settings />}
      </main>
    </div>
  );
}
