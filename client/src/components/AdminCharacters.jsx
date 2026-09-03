import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const EMPTY = {
  name: '',
  species: '',
  personality: '',
  description: '',
  color: '#F0776C',
  emoji: '⭐'
};

export default function AdminCharacters() {
  const [characters, setCharacters] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  function load() {
    api.getCharacters().then(setCharacters).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      await api.createCharacter(form);
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await api.deleteCharacter(id);
    load();
  }

  return (
    <div className="admin">
      <h2>Personagens</h2>
      <p className="sub">
        Cada personagem tem uma descrição curta — é esse texto que serve de contexto quando pedires a
        um LLM para gerar novos cenários para ela.
      </p>

      <div className="admin-layout">
        <div className="list">
          {characters.map((c) => (
            <div className="row" key={c.id}>
              <span className="avatar" style={{ background: c.color }}>
                {c.emoji}
              </span>
              <div className="meta">
                <strong>{c.name}</strong>
                <span>{c.personality || c.species || 'sem descrição'}</span>
              </div>
              <button onClick={() => handleDelete(c.id)}>remover</button>
            </div>
          ))}
          {characters.length === 0 && <p className="empty">Ainda não há personagens.</p>}
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <h3>Nova personagem</h3>

          <label>
            Nome
            <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
          </label>

          <div className="form-row">
            <label>
              Espécie
              <input value={form.species} onChange={(e) => update('species', e.target.value)} />
            </label>
            <label>
              Emoji
              <input value={form.emoji} onChange={(e) => update('emoji', e.target.value)} maxLength={4} />
            </label>
          </div>

          <label>
            Personalidade
            <input
              value={form.personality}
              onChange={(e) => update('personality', e.target.value)}
              placeholder="ex: curioso e brincalhão"
            />
          </label>

          <label>
            Descrição (contexto para o LLM)
            <textarea
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
            />
          </label>

          <label>
            Cor
            <input type="color" value={form.color} onChange={(e) => update('color', e.target.value)} />
          </label>

          <button className="submit" type="submit">
            Adicionar personagem
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
}
