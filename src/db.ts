import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { config } from './config.js';

fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
for (const dir of [config.videoDir, config.posterDir, config.subtitleDir, config.uploadDir]) fs.mkdirSync(dir, { recursive: true });
// node:sqlite's parameter overloads are stricter than Express' validated route
// types. Keep the database boundary dynamic and validate every input with Zod.
export const db: any = new DatabaseSync(config.databasePath);
db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY, username TEXT UNIQUE NOT NULL, display_name TEXT NOT NULL, password_hash TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('admin','viewer')), active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS refresh_tokens(id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, token_hash TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, revoked_at TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS movies(id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', year INTEGER, duration_seconds REAL, genres_json TEXT NOT NULL DEFAULT '[]', content_rating TEXT, video_path TEXT, poster_path TEXT, mime_type TEXT, file_size INTEGER, video_codec TEXT, audio_codec TEXT, width INTEGER, height INTEGER, status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','uploading','processing','published','hidden','error')), created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS subtitles(id TEXT PRIMARY KEY, movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE, language TEXT NOT NULL, label TEXT NOT NULL, path TEXT NOT NULL, format TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS uploads(id TEXT PRIMARY KEY, movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE, file_name TEXT NOT NULL, temporary_path TEXT NOT NULL, expected_size INTEGER NOT NULL, received_bytes INTEGER NOT NULL DEFAULT 0, mime_type TEXT NOT NULL, sha256_expected TEXT, status TEXT NOT NULL DEFAULT 'pending', expires_at TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS playback_progress(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE, position_seconds REAL NOT NULL, duration_seconds REAL NOT NULL, completed INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY(user_id,movie_id));
CREATE TABLE IF NOT EXISTS favorites(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE, created_at TEXT NOT NULL, PRIMARY KEY(user_id,movie_id));
CREATE INDEX IF NOT EXISTS idx_movies_status ON movies(status); CREATE INDEX IF NOT EXISTS idx_uploads_status ON uploads(status);`);
