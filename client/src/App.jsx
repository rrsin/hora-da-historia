import React, { useState } from 'react';
import StoryMode from './components/StoryMode.jsx';
import AdminCharacters from './components/AdminCharacters.jsx';
import AdminScenarios from './components/AdminScenarios.jsx';

const TABS = [
  { id: 'story', label: 'Contar história' },
  { id: 'characters', label: 'Personagens' },
  { id: 'scenarios', label: 'Cenários' }
];

export default function App() {
  const [tab, setTab] = useState('story');

  return (
    <>
      <div className="topnav">
        <div className="brand">
          <span className="spark">✨</span> Histórias da Noite
        </div>
        <div className="tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={tab === t.id ? 'active' : ''}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'story' && <StoryMode />}
      {tab === 'characters' && <AdminCharacters />}
      {tab === 'scenarios' && <AdminScenarios />}
    </>
  );
}
