const FRIENDLY_ERRORS: Record<string, string> = {
  'redirect_uri not registered for this client':
    'This site is not registered for sign-in. The callback URL must be added to the OAuth client.',
  'Invalid credentials': 'Email/FidId or password is incorrect.',
  'Missing or invalid authorization header': 'Your session expired. Please sign in again.',
  'Authorization code already used': 'This sign-in link was already used. Please sign in again.',
  'Invalid or expired authorization code': 'Sign-in expired. Please try again.',
  'Invalid token': 'Your session expired. Please sign in again.',
  'Invalid or expired refresh_token': 'Your session expired. Please sign in again.',
};

function firstString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
    if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0].trim();
  }
  return undefined;
}

export function parseApiError(raw: string, fallback: string): string {
  if (!raw?.trim()) return fallback;

  let message = raw.trim();
  try {
    const parsed = JSON.parse(raw);
    message =
      firstString(
        parsed?.error?.message,
        parsed?.error,
        parsed?.message,
        parsed?.data?.message,
      ) || message;
  } catch {
    // already a plain string
  }

  return FRIENDLY_ERRORS[message] || message;
}

export function errorFromUnknown(err: unknown, fallback: string): string {
  const raw = err instanceof Error ? err.message : String(err || '');
  return parseApiError(raw, fallback);
}
