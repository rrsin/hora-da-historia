const BASE = '/api';

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Erro ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  getCharacters: () => fetch(`${BASE}/characters`).then(handle),
  createCharacter: (data) =>
    fetch(`${BASE}/characters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handle),
  updateCharacter: (id, data) =>
    fetch(`${BASE}/characters/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handle),
  deleteCharacter: (id) => fetch(`${BASE}/characters/${id}`, { method: 'DELETE' }).then(handle),

  getScenarios: () => fetch(`${BASE}/scenarios`).then(handle),
  createScenario: (data) =>
    fetch(`${BASE}/scenarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(handle),
  deleteScenario: (id) => fetch(`${BASE}/scenarios/${id}`, { method: 'DELETE' }).then(handle),

  generateStory: (characterIds) =>
    fetch(`${BASE}/story`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ characterIds })
    }).then(handle)
};
