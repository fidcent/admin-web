import { parseApiError } from './errors';

export type AdminSession = {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
  role?: string;
  fidId?: string;
  /** Unix timestamp (ms) when the access token expires */
  expiresAt?: number;
};

const STORAGE_KEY = 'admin_web_session';

export function getEnv() {
  const identityBaseUrl = process.env.NEXT_PUBLIC_IDENTITY_BASE_URL || 'http://localhost:3001';
  const wishcenterBaseUrl = process.env.NEXT_PUBLIC_WISHCENTER_BASE_URL || 'http://localhost:3003';
  const clientId = process.env.NEXT_PUBLIC_ADMIN_OAUTH_CLIENT_ID || '';

  return { identityBaseUrl, wishcenterBaseUrl, clientId };
}

function randomString(size = 64): string {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const bytes = new Uint8Array(digest);
  const str = btoa(String.fromCharCode(...bytes));
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function startAdminLogin(identifier: string, password: string): Promise<void> {
  const { identityBaseUrl, clientId } = getEnv();
  if (!clientId) throw new Error('Missing NEXT_PUBLIC_ADMIN_OAUTH_CLIENT_ID');

  const redirectUri = `${window.location.origin}/auth/callback`;
  const state = randomString(16);
  const verifier = randomString(48);
  const challenge = await sha256Base64Url(verifier);

  sessionStorage.setItem('admin_oauth_state', state);
  sessionStorage.setItem('admin_oauth_verifier', verifier);

  const response = await fetch(`${identityBaseUrl}/oauth/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
      identifier,
      password,
    }),
  });

  if (!response.ok) {
    throw new Error(parseApiError(await response.text(), 'Signin failed'));
  }

  const json = await response.json();
  const redirectUrl = json?.data?.redirect_url;
  if (!redirectUrl) throw new Error('Missing redirect_url');
  window.location.assign(redirectUrl);
}

export async function completeAdminLogin(code: string, state: string): Promise<AdminSession> {
  const { identityBaseUrl, clientId } = getEnv();
  const expectedState = sessionStorage.getItem('admin_oauth_state');
  const verifier = sessionStorage.getItem('admin_oauth_verifier');
  if (!expectedState || expectedState !== state) throw new Error('Invalid OAuth state');
  if (!verifier) throw new Error('Missing verifier');

  const redirectUri = `${window.location.origin}/auth/callback`;
  const tokenResp = await fetch(`${identityBaseUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });

  if (!tokenResp.ok) throw new Error(parseApiError(await tokenResp.text(), 'Token exchange failed'));
  const tokenJson = await tokenResp.json();
  const tokens = tokenJson?.data ?? tokenJson;
  const accessToken = tokens?.access_token;
  if (!accessToken) throw new Error('Missing access_token in token response');

  const infoResp = await fetch(`${identityBaseUrl}/oauth/userinfo`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!infoResp.ok) throw new Error(parseApiError(await infoResp.text(), 'Failed to load userinfo'));
  const infoJson = await infoResp.json();
  const info = infoJson?.data ?? infoJson;

  const session: AdminSession = {
    accessToken,
    refreshToken: tokens.refresh_token,
    idToken: tokens.id_token,
    role: info.role,
    fidId: info.fid_id,
    expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  sessionStorage.removeItem('admin_oauth_state');
  sessionStorage.removeItem('admin_oauth_verifier');

  return session;
}

export function getAdminSession(): AdminSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    return null;
  }
}

export function clearAdminSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export async function refreshAdminSession(): Promise<AdminSession | null> {
  const session = getAdminSession();
  if (!session?.refreshToken) {
    clearAdminSession();
    return null;
  }

  const { identityBaseUrl, clientId } = getEnv();
  if (!clientId) {
    clearAdminSession();
    return null;
  }

  const tokenResp = await fetch(`${identityBaseUrl}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: session.refreshToken,
    }),
  });

  if (!tokenResp.ok) {
    clearAdminSession();
    return null;
  }

  const tokenJson = await tokenResp.json();
  const tokens = tokenJson?.data ?? tokenJson;
  const accessToken = tokens?.access_token;
  if (!accessToken) {
    clearAdminSession();
    return null;
  }

  const updated: AdminSession = {
    ...session,
    accessToken,
    refreshToken: tokens.refresh_token || session.refreshToken,
    idToken: tokens.id_token || session.idToken,
    expiresAt: Date.now() + (tokens.expires_in || 3600) * 1000,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/** Return a valid session, refreshing the access token when expired or near expiry. */
export async function ensureAdminSession(): Promise<AdminSession | null> {
  const session = getAdminSession();
  if (!session?.accessToken) return null;

  const expiresAt = session.expiresAt ?? 0;
  const shouldRefresh = !!expiresAt && Date.now() >= expiresAt - 60_000;

  if (!shouldRefresh) return session;
  return refreshAdminSession();
}
