import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const keys = ['OT_API_BASE', 'FRONTEND_API_BASE', 'VERCEL_API_BASE', 'API_BASE'];
const fallback = 'http://localhost:3000';

const picked = keys
  .map((key) => (process.env[key] || '').trim())
  .find((value) => value.length > 0);

const apiBase = (picked || fallback).replace(/\/+$/, '');
const outputPath = resolve(process.cwd(), 'public', 'config.js');

const content = `window.__APP_CONFIG = Object.assign({}, window.__APP_CONFIG, {\n  API_BASE: ${JSON.stringify(apiBase)},\n});\n`;

mkdirSync(resolve(process.cwd(), 'public'), { recursive: true });
writeFileSync(outputPath, content, 'utf8');

console.log(`[config] Wrote public/config.js with API_BASE=${apiBase}`);
