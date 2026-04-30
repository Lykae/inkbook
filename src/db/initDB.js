import initSqlJs from 'sql.js';
import {loadDB} from './loadDB';

let db;

export async function initDB() {
  if (db) return db;

  const SQL = await initSqlJs({
    locateFile: file => `/sql-wasm.wasm`
  });

  // 👇 try restore first
  db = loadDB(SQL);

  if (!db) {
    db = new SQL.Database();

    db.run(`
      CREATE TABLE IF NOT EXISTS decks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        data TEXT
      );
    `);
    
    db.run(`
      CREATE TABLE IF NOT EXISTS cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        cost INTEGER,
        type TEXT,
        color TEXT,
        inkable INTEGER,
        body_text TEXT,
        flavor_text TEXT,
        artist TEXT,
        rarity TEXT,
        image TEXT,
        set_name TEXT,
        set_id TEXT,
        set_num INTEGER,
        date_added TEXT,
        date_modified TEXT,
        classifications TEXT,
        strength INTEGER,
        willpower INTEGER,
        lore INTEGER
      );
    `);
  }

  return db;
}