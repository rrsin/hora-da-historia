import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function StoryMode() {
  const [characters, setCharacters] = useState([]);
  const [selected, setSelected] = useState([]); // ordered array of ids
  const [story, setStory] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCharacters().then(setCharacters).catch((e) => setError(e.message));
  }, []);

  function toggle(id) {
    setStory(null);
    setError(null);
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    try {
      const result = await api.generateStory(selected);
      setStory(result);
    } catch (e) {
      setStory(null);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="stage">
      <h1>Quem vai brilhar na história de hoje?</h1>
      <p className="sub">Escolhe as personagens e deixa a magia acontecer.</p>

      <div className="picker">
        {characters.map((c) => {
          const idx = selected.indexOf(c.id);
          const isSelected = idx !== -1;
          return (
            <button
              key={c.id}
              className={`badge ${isSelected ? 'selected' : ''}`}
              onClick={() => toggle(c.id)}
            >
              <span className="circle" style={{ background: c.color }}>
                {c.emoji}
              </span>
              {isSelected && <span className="order">{idx + 1}</span>}
              {c.name}
            </button>
          );
        })}
        {characters.length === 0 && (
          <p className="empty">
            Ainda não há personagens. Vai ao separador "Personagens" para criar as primeiras.
          </p>
        )}
      </div>

      <button
        className="generate-btn"
        disabled={selected.length === 0 || loading}
        onClick={handleGenerate}
      >
        {loading ? 'A imaginar...' : 'Contar história'}
      </button>

      {error && <p className="error-msg">{error}</p>}

      {story && (
        <div className="storybook-page">
          <div className="mood">{story.mood}</div>
          <h2>{story.title}</h2>
          <p>{story.text}</p>
        </div>
      )}
    </div>
  );
}
