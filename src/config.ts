import 'dotenv/config';
import path from 'node:path';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().default('127.0.0.1'), PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_PATH: z.string().default('./data/alpinefilm.sqlite'), VIDEO_DIR: z.string().default('./data/videos'),
  POSTER_DIR: z.string().default('./data/posters'), SUBTITLE_DIR: z.string().default('./data/subtitles'), UPLOAD_DIR: z.string().default('./data/uploads'),
  JWT_ACCESS_SECRET: z.string().min(32).default('development-access-secret-32-chars'),
  JWT_PLAYBACK_SECRET: z.string().min(32).default('development-playback-secret-32chars'),
  REGISTRATION_INVITE_CODE: z.string().min(8).default('alpinefilm-dev-invite'),
  ACCESS_TOKEN_TTL: z.string().default('15m'), REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().min(1).max(365).default(30), PLAYBACK_TOKEN_TTL: z.string().default('2h'),
  UPLOAD_CHUNK_BYTES: z.coerce.number().int().positive().default(8 * 1024 * 1024),
  MAX_POSTER_BYTES: z.coerce.number().int().positive().default(5 * 1024 * 1024), MAX_SUBTITLE_BYTES: z.coerce.number().int().positive().default(2 * 1024 * 1024),
  CORS_ORIGINS: z.string().default('*'),
});

const parsed = schema.parse(process.env);
export const config = { ...parsed, databasePath: path.resolve(parsed.DATABASE_PATH), videoDir: path.resolve(parsed.VIDEO_DIR), posterDir: path.resolve(parsed.POSTER_DIR), subtitleDir: path.resolve(parsed.SUBTITLE_DIR), uploadDir: path.resolve(parsed.UPLOAD_DIR) };
