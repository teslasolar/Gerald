import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '..', '..', 'gerald.db');

let db;

export function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    migrate(db);
  }
  return db;
}

function migrate(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS signatories (
      user_id TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      signed_at TEXT NOT NULL DEFAULT (datetime('now')),
      tier INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      actor_id TEXT,
      action TEXT NOT NULL,
      target_id TEXT,
      channel_id TEXT,
      detail TEXT,
      level TEXT DEFAULT 'info'
    );

    CREATE TABLE IF NOT EXISTS fame (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      nominated_by TEXT NOT NULL,
      reason TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      thread_id TEXT,
      status TEXT DEFAULT 'pending',
      votes INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS shame (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      flagged_by TEXT NOT NULL,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      thread_id TEXT,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS worship_tracker (
      user_id TEXT PRIMARY KEY,
      level INTEGER DEFAULT 0,
      last_trigger TEXT
    );
  `);
}

// --- Signatory operations ---

export function addSignatory(userId, username) {
  const stmt = getDb().prepare(
    'INSERT OR REPLACE INTO signatories (user_id, username) VALUES (?, ?)'
  );
  return stmt.run(userId, username);
}

export function getSignatory(userId) {
  return getDb().prepare('SELECT * FROM signatories WHERE user_id = ?').get(userId);
}

export function isSignatory(userId) {
  return !!getSignatory(userId);
}

export function setTier(userId, tier) {
  return getDb().prepare('UPDATE signatories SET tier = ? WHERE user_id = ?').run(tier, userId);
}

export function getAllSignatories() {
  return getDb().prepare('SELECT * FROM signatories ORDER BY signed_at').all();
}

// --- Audit log ---

export function logAudit(action, { actorId, targetId, channelId, detail, level } = {}) {
  const stmt = getDb().prepare(
    'INSERT INTO audit_log (actor_id, action, target_id, channel_id, detail, level) VALUES (?, ?, ?, ?, ?, ?)'
  );
  return stmt.run(actorId || null, action, targetId || null, channelId || null, detail || null, level || 'info');
}

// --- Worship tracker ---

export function getWorshipLevel(userId) {
  const row = getDb().prepare('SELECT * FROM worship_tracker WHERE user_id = ?').get(userId);
  return row ? row.level : 0;
}

export function setWorshipLevel(userId, level) {
  const stmt = getDb().prepare(
    'INSERT OR REPLACE INTO worship_tracker (user_id, level, last_trigger) VALUES (?, ?, datetime(\'now\'))'
  );
  return stmt.run(userId, level);
}

export function resetWorshipLevel(userId) {
  return getDb().prepare('DELETE FROM worship_tracker WHERE user_id = ?').run(userId);
}

// --- Fame/Shame ---

export function createFameNomination(userId, nominatedBy, reason, threadId) {
  const stmt = getDb().prepare(
    'INSERT INTO fame (user_id, nominated_by, reason, thread_id) VALUES (?, ?, ?, ?)'
  );
  return stmt.run(userId, nominatedBy, reason || null, threadId || null);
}

export function createShameFlag(userId, flaggedBy, reason, threadId) {
  const stmt = getDb().prepare(
    'INSERT INTO shame (user_id, flagged_by, reason, thread_id) VALUES (?, ?, ?, ?)'
  );
  return stmt.run(userId, flaggedBy, reason, threadId || null);
}
