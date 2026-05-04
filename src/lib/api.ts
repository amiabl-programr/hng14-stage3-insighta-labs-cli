import axios from 'axios';
import open from 'open';
import {
  getCredentials,
  saveCredentials,
  clearCredentials,
  isTokenExpired,
} from '../config/store.js';

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const API_VERSION = process.env.API_VERSION || '1';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
});

// ── Request interceptor: attach Bearer token + API version ───────────────────
client.interceptors.request.use(
  async (config) => {
    // Always add API version header for profile endpoints
    if (config.url?.startsWith('/api/')) {
      config.headers['X-API-Version'] = API_VERSION;
    }

    let creds = getCredentials();
    if (!creds) return config;

    // Auto-refresh if expired and a refreshToken exists
    if (isTokenExpired(creds)) {
      if (creds.refreshToken) {
        try {
          creds = await refreshAccessToken(creds.refreshToken);
        } catch {
          clearCredentials();
          return Promise.reject(new Error('Session expired. Please run `insighta login` again.'));
        }
      } else {
        clearCredentials();
        return Promise.reject(new Error('Token expired. Please run `insighta login` again.'));
      }
    }

    config.headers.Authorization = `Bearer ${creds.accessToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

// ── Response interceptor: clean error messages ────────────────────────────────
client.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message;

    if (status === 401) {
      clearCredentials();
      return Promise.reject(new Error('Unauthorised. Please run `insighta login` again.'));
    }
    if (status === 403) {
      return Promise.reject(new Error('Access denied.'));
    }
    if (status === 429) {
      return Promise.reject(new Error('Rate limit exceeded. Try again later.'));
    }
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timed out. Check your network.'));
    }
    if (!error.response) {
      return Promise.reject(new Error('Network error — is the server reachable?'));
    }

    return Promise.reject(new Error(serverMessage || `Request failed (${status})`));
  },
);

// ── Auth helpers ──────────────────────────────────────────────────────────────

const POLL_INTERVAL = 2000;
const MAX_POLL_ATTEMPTS = 150;
const AUTH_TIMEOUT = MAX_POLL_ATTEMPTS * POLL_INTERVAL;

export async function initiateLogin() {
  const { data } = await axios.get(`${BASE_URL}/auth/github`, {
    params: { client: 'cli' },
  });

  if (!data.auth_url || !data.temp_token) {
    throw new Error('Invalid response from auth server');
  }

  return { authUrl: data.auth_url, tempToken: data.temp_token };
}

export async function openBrowser(authUrl: string) {
  await open(authUrl);
}

export async function pollForTokens(tempToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user?: {
    id: string;
    username: string;
    email: string;
    avatar_url?: string;
    role: string;
  };
}> {
  let attempts = 0;

  while (attempts < MAX_POLL_ATTEMPTS) {
    try {
      const { data, status } = await axios.get(`${BASE_URL}/auth/github/callback`, {
        params: { temp_token: tempToken },
      });

      if (status === 202) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        attempts++;
        continue;
      }

      if (data.status === 'error') {
        throw new Error(data.message || 'Authentication failed');
      }

      if (data.access_token && data.refresh_token) {
        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in || 900,
          user: data.user,
        };
      }
    } catch (error: any) {
      if (error.response?.status === 410) {
        throw new Error('Session expired. Please run `insighta login` again.');
      }
      if (error.response?.status === 202) {
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
        attempts++;
        continue;
      }
      throw error;
    }
  }

  throw new Error('Authentication timed out. Please try again.');
}

export async function completeLogin() {
  const { authUrl, tempToken } = await initiateLogin();
  await openBrowser(authUrl);
  const tokens = await pollForTokens(tempToken);

  const credentials = {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: Date.now() + tokens.expiresIn * 1000,
    user: tokens.user,
  };

  saveCredentials(credentials);
  return credentials;
}

async function refreshAccessToken(refreshToken: string) {
  const { data } = await axios.post(`${BASE_URL}/auth/refresh`, {
    refreshToken,
  });

  const creds = getCredentials();
  const updated = {
    ...creds,
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: data.expires_in ? Date.now() + data.expires_in * 1000 : null,
  };

  saveCredentials(updated);
  return updated;
}

export async function logout() {
  const creds = getCredentials();
  if (!creds) return;

  try {
    await client.post('/auth/logout');
  } catch {
    // Server-side revocation is best-effort; always clear locally
  } finally {
    clearCredentials();
  }
}

export function getStoredUser() {
  const creds = getCredentials();
  return creds?.user || null;
}

export default client;
