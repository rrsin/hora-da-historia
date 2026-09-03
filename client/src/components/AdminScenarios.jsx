import React, { useEffect, useState } from 'react';
import { api } from '../api.js';

const EMPTY = { title: '', template: '', mood: 'aventura', num_characters: 2 };

export default function AdminScenarios() {
  const [scenarios, setScenarios] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState(null);

  function load() {
    api.getScenarios().then(setScenarios).catch((e) => setError(e.message));
  }

  useEffect(load, []);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.template.trim()) return;
    try {
      await api.createScenario({ ...form, num_characters: Number(form.num_characters) });
      setForm(EMPTY);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    await api.deleteScenario(id);
    load();
  }

  return (
    <div className="admin">
      <h2>Cenários</h2>
      <p className="sub">
        Usa {'{char1}'}, {'{char2}'} e {'{char3}'} no texto — são substituídos pelos nomes das
        personagens escolhidas, pela ordem em que foram escolhidas. Cola aqui os cenários gerados
        offline por um LLM.
      </p>

      <div className="admin-layout">
        <div className="list">
          {scenarios.map((s) => (
            <div className="row" key={s.id}>
              <span className="avatar" style={{ background: '#8C7AA9' }}>
                {s.num_characters}
              </span>
              <div className="meta">
                <strong>{s.title}</strong>
                <span>{s.mood} · {s.template}</span>
              </div>
              <button onClick={() => handleDelete(s.id)}>remover</button>
            </div>
          ))}
          {scenarios.length === 0 && <p className="empty">Ainda não há cenários.</p>}
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <h3>Novo cenário</h3>

          <label>
            Título
            <input value={form.title} onChange={(e) => update('title', e.target.value)} required />
          </label>

          <label>
            Texto (com {'{char1}'}, {'{char2}'}...)
            <textarea
              value={form.template}
              onChange={(e) => update('template', e.target.value)}
              required
            />
          </label>

          <div className="form-row">
            <label>
              Disposição
              <select value={form.mood} onChange={(e) => update('mood', e.target.value)}>
                <option value="aventura">aventura</option>
                <option value="calma">calma</option>
                <option value="engracada">engraçada</option>
                <option value="amizade">amizade</option>
              </select>
            </label>
            <label>
              Nº de personagens
              <select
                value={form.num_characters}
                onChange={(e) => update('num_characters', e.target.value)}
              >
                <option value={1}>1</option>
                <option value={2}>2</option>
                <option value={3}>3</option>
              </select>
            </label>
          </div>

          <button className="submit" type="submit">
            Adicionar cenário
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
}
