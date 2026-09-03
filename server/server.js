import express from 'express';
import cors from 'cors';
import db from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 4000;

// ---------- Characters ----------

app.get('/api/characters', (req, res) => {
  const rows = db.prepare('SELECT * FROM characters ORDER BY name').all();
  res.json(rows);
});

app.post('/api/characters', (req, res) => {
  const { name, species, personality, description, color, emoji } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const info = db
    .prepare(
      `INSERT INTO characters (name, species, personality, description, color, emoji)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(name, species ?? null, personality ?? null, description ?? null, color ?? '#F0776C', emoji ?? '⭐');

  const row = db.prepare('SELECT * FROM characters WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(row);
});

app.put('/api/characters/:id', (req, res) => {
  const { id } = req.params;
  const existing = db.prepare('SELECT * FROM characters WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'not found' });

  const merged = { ...existing, ...req.body };
  db.prepare(
    `UPDATE characters SET name=?, species=?, personality=?, description=?, color=?, emoji=? WHERE id=?`
  ).run(merged.name, merged.species, merged.personality, merged.description, merged.color, merged.emoji, id);

  res.json(db.prepare('SELECT * FROM characters WHERE id = ?').get(id));
});

app.delete('/api/characters/:id', (req, res) => {
  db.prepare('DELETE FROM characters WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---------- Scenarios ----------

app.get('/api/scenarios', (req, res) => {
  const rows = db.prepare('SELECT * FROM scenarios ORDER BY id').all();
  res.json(rows);
});

app.post('/api/scenarios', (req, res) => {
  const { title, template, mood, num_characters } = req.body;
  if (!title || !template) return res.status(400).json({ error: 'title and template are required' });

  const info = db
    .prepare(
      `INSERT INTO scenarios (title, template, mood, num_characters) VALUES (?, ?, ?, ?)`
    )
    .run(title, template, mood ?? 'aventura', num_characters ?? 2);

  res.status(201).json(db.prepare('SELECT * FROM scenarios WHERE id = ?').get(info.lastInsertRowid));
});

app.delete('/api/scenarios/:id', (req, res) => {
  db.prepare('DELETE FROM scenarios WHERE id = ?').run(req.params.id);
  res.status(204).end();
});

// ---------- Story generation ----------
// The child picks N characters; we randomly pick a scenario template that
// expects exactly that many characters, then fill in the placeholders.

app.post('/api/story', (req, res) => {
  const { characterIds } = req.body;
  if (!Array.isArray(characterIds) || characterIds.length === 0) {
    return res.status(400).json({ error: 'characterIds must be a non-empty array' });
  }

  const placeholders = characterIds.map((_, i) => `?`).join(',');
  const chosen = db
    .prepare(`SELECT * FROM characters WHERE id IN (${placeholders})`)
    .all(...characterIds);

  if (chosen.length !== characterIds.length) {
    return res.status(400).json({ error: 'one or more characterIds do not exist' });
  }

  // Keep the order the child picked them in.
  const orderedChosen = characterIds.map((id) => chosen.find((c) => c.id === id));

  const candidates = db
    .prepare('SELECT * FROM scenarios WHERE num_characters = ?')
    .all(orderedChosen.length);

  if (candidates.length === 0) {
    return res.status(404).json({
      error: `No scenario templates exist for ${orderedChosen.length} character(s) yet.`
    });
  }

  const scenario = candidates[Math.floor(Math.random() * candidates.length)];

  let text = scenario.template;
  orderedChosen.forEach((char, i) => {
    text = text.split(`{char${i + 1}}`).join(char.name);
  });

  res.json({
    title: scenario.title,
    text,
    mood: scenario.mood,
    characters: orderedChosen,
    scenarioId: scenario.id
  });
});

app.listen(PORT, () => {
  console.log(`Servidor de histórias a correr em http://localhost:${PORT}`);
});
