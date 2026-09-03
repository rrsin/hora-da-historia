// Smoke tests: boot the real Express app against a throwaway SQLite file
// and exercise the endpoints the UI actually calls end-to-end. Not a full
// unit-test suite - just enough to catch "the app doesn't start" or
// "the API contract broke" before it reaches Docker/the Pi.
//
// Uses Node's built-in test runner (Node 18+), so there's nothing extra to
// install. Run with: npm test

import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// db.js reads DB_PATH at import time, so it must be set before app.js
// (which imports db.js) is ever imported. A fresh temp file per run keeps
// tests isolated from your real dev database and from each other.
const dbPath = path.join(os.tmpdir(), `bedtime-story-smoke-${Date.now()}.db`);
process.env.DB_PATH = dbPath;

const { default: app } = await import('../app.js');

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  fs.rmSync(dbPath, { force: true });
  fs.rmSync(`${dbPath}-wal`, { force: true });
  fs.rmSync(`${dbPath}-shm`, { force: true });
});

test('GET /api/characters starts empty on a fresh database', async () => {
  const res = await fetch(`${baseUrl}/api/characters`);
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.deepEqual(body, []);
});

test('POST /api/characters creates a character', async () => {
  const res = await fetch(`${baseUrl}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Urso', emoji: '🐻', color: '#B5794A' })
  });
  assert.equal(res.status, 201);
  const body = await res.json();
  assert.equal(body.name, 'Urso');
  assert.ok(body.id);
});

test('POST /api/characters rejects a missing name', async () => {
  const res = await fetch(`${baseUrl}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ emoji: '🦄' })
  });
  assert.equal(res.status, 400);
});

test('story generation fills in the chosen characters, in order', async () => {
  const urso = await fetch(`${baseUrl}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TestUrso' })
  }).then((r) => r.json());

  const unicornio = await fetch(`${baseUrl}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'TestUnicornio' })
  }).then((r) => r.json());

  await fetch(`${baseUrl}/api/scenarios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'Cenário de teste',
      template: '{char1} e {char2} foram à praia.',
      mood: 'aventura',
      num_characters: 2
    })
  });

  const res = await fetch(`${baseUrl}/api/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterIds: [urso.id, unicornio.id] })
  });
  assert.equal(res.status, 200);

  const story = await res.json();
  assert.match(story.text, /TestUrso/);
  assert.match(story.text, /TestUnicornio/);
  assert.doesNotMatch(story.text, /\{char\d\}/);
});

test('story generation 404s when no scenario fits the character count', async () => {
  const solo = await fetch(`${baseUrl}/api/characters`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Solitário' })
  }).then((r) => r.json());

  const res = await fetch(`${baseUrl}/api/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterIds: [solo.id] })
  });
  assert.equal(res.status, 404);
});

test('story generation 400s on an unknown character id', async () => {
  const res = await fetch(`${baseUrl}/api/story`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ characterIds: [999999] })
  });
  assert.equal(res.status, 400);
});
