import { getAdminSession, getEnv } from './oidc';

export async function adminApi<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getAdminSession();
  if (!session?.accessToken) throw new Error('No active admin session');

  const { wishcenterBaseUrl } = getEnv();
  const response = await fetch(`${wishcenterBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.accessToken}`,
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
