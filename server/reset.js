// Drops every table and recreates the schema from scratch.
// Usage: npm run reset          -> wipe only
//        npm run reset -- --seed -> wipe and immediately reseed
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, 'stories.db');

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

console.log('A apagar tabelas existentes...');
db.exec(`
  DROP TABLE IF EXISTS characters;
  DROP TABLE IF EXISTS scenarios;
`);

console.log('A recriar o esquema...');
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
db.exec(schema);

db.close();
console.log('Base de dados reiniciada:', DB_PATH);

if (process.argv.includes('--seed')) {
  console.log('A semear dados de exemplo...');
  const { execSync } = await import('child_process');
  execSync('node seed.js', { cwd: __dirname, stdio: 'inherit' });
}
