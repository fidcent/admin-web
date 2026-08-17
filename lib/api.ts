import {
  clearAdminSession,
  ensureAdminSession,
  getAdminSession,
  getEnv,
  refreshAdminSession,
} from './oidc';
import { parseApiError } from './errors';

async function fetchWithAdminAuth(
  path: string,
  session: { accessToken: string },
  init?: RequestInit,
): Promise<Response> {
  const { wishcenterBaseUrl } = getEnv();
  return fetch(`${wishcenterBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
      ...(init?.headers || {}),
    },
  });
}

export async function adminApi<T>(path: string, init?: RequestInit): Promise<T> {
  let session = await ensureAdminSession();
  if (!session?.accessToken) throw new Error('No active admin session');

  let response = await fetchWithAdminAuth(path, session, init);

  if (response.status === 401) {
    session = await refreshAdminSession();
    if (!session?.accessToken) {
      clearAdminSession();
      if (typeof window !== 'undefined') {
        window.location.assign('/');
      }
      throw new Error('Your session expired. Please sign in again.');
    }
    response = await fetchWithAdminAuth(path, session, init);
  }

  if (!response.ok) {
    const text = await response.text();
    const message = parseApiError(text, `Request failed: ${response.status}`);

    if (
      response.status === 401 ||
      message.toLowerCase().includes('invalid token') ||
      message.toLowerCase().includes('session expired')
    ) {
      clearAdminSession();
      if (typeof window !== 'undefined') {
        window.location.assign('/');
      }
      throw new Error('Your session expired. Please sign in again.');
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

/** @deprecated use ensureAdminSession — kept for pages that only check local session */
export { getAdminSession };
