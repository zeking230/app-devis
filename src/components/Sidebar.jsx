import React from 'react';
import { useApp } from '../context/AppContext.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Tableau de bord', icon: '📊' },
  { id: 'clients', label: 'Clients', icon: '👤' },
  { id: 'articles', label: 'Mes articles', icon: '📦' },
  { id: 'editor', label: 'Nouveau document', icon: '🧾' },
  { id: 'settings', label: 'Entreprise', icon: '🏢' },
];

export default function Sidebar() {
  const { view, setView, settings, setEditingDocId } = useApp();

  return (
    <aside className="side">
      <div className="brand">
        {settings.logo ? (
          <img src={settings.logo} alt="" className="mark-img" />
        ) : (
          <div className="mark">{(settings.name || 'ME').slice(0, 2).toUpperCase()}</div>
        )}
        <span>{settings.name || 'Mon entreprise'}</span>
      </div>
      <nav>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={view === item.id ? 'active' : ''}
            onClick={() => {
              if (item.id === 'editor') setEditingDocId(null);
              setView(item.id);
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div className="foot">
        Stockage local du navigateur
        <br />
        Pensez à exporter vos données.
      </div>
    </aside>
  );
}
