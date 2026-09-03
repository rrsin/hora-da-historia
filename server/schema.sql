-- Personagens (characters) that a child can pick each night
CREATE TABLE IF NOT EXISTS characters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  species TEXT,                 -- ex: "urso", "unicornio"
  personality TEXT,              -- ex: "curioso e brincalhao"
  description TEXT,              -- short bio used as LLM context when generating new scenarios
  color TEXT DEFAULT '#F0776C',  -- hex color used for the character's card
  emoji TEXT DEFAULT '⭐',       -- avatar shown in the picker
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Cenarios (scenario templates), normally pre-generated offline by an LLM
-- and stored here. {char1}/{char2}/{char3} are replaced at story time with
-- the chosen characters' names, in the order they were picked.
CREATE TABLE IF NOT EXISTS scenarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  template TEXT NOT NULL,        -- body text with {char1}/{char2}/{char3} placeholders
  mood TEXT DEFAULT 'aventura',  -- ex: aventura, calma, engracada, amizade
  num_characters INTEGER NOT NULL DEFAULT 2, -- how many placeholders it expects
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
