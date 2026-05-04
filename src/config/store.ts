import fs from 'fs';
import path from 'path';
import os from 'os';

const CREDENTIALS_DIR = path.join(os.homedir(), '.insighta');
const CREDENTIALS_FILE = path.join(CREDENTIALS_DIR, 'credentials.json');

function ensureDir() {
  if (!fs.existsSync(CREDENTIALS_DIR)) {
    fs.mkdirSync(CREDENTIALS_DIR, { recursive: true, mode: 0o700 });
  }
}

export function saveCredentials(data: any) {
  ensureDir();
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(data, null, 2), {
    mode: 0o600,
  });
}

export function getCredentials() {
  if (!fs.existsSync(CREDENTIALS_FILE)) return null;
  try {
    const raw = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    fs.unlinkSync(CREDENTIALS_FILE);
  }
}

export function isTokenExpired(credentials: any) {
  if (!credentials?.expiresAt) return false;
  // Treat as expired 60 seconds before actual expiry (buffer)
  return Date.now() >= credentials.expiresAt - 60_000;
}
