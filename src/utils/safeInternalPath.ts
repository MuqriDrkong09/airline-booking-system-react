/**
 * Validates same-origin relative return paths used after login / 401 redirects.
 * Rejects protocol-relative URLs, external origins, and prefix tricks like `/apple`.
 */
export function isSafeInternalPath(
  candidate: string | null | undefined,
  allowedRoots: readonly string[],
): boolean {
  if (!candidate || typeof candidate !== 'string') {
    return false;
  }

  if (!candidate.startsWith('/') || candidate.startsWith('//') || candidate.includes('\\')) {
    return false;
  }

  let pathname: string;
  try {
    const url = new URL(candidate, 'https://aerobook.local');
    if (url.origin !== 'https://aerobook.local') {
      return false;
    }
    pathname = url.pathname;
  } catch {
    return false;
  }

  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded.startsWith('//') || decoded.includes('://') || decoded.includes('\\')) {
      return false;
    }
    pathname = decoded;
  } catch {
    return false;
  }

  return allowedRoots.some((root) => pathname === root || pathname.startsWith(`${root}/`));
}

/** Returns pathname + search for a safe internal path, or null. */
export function toSafeInternalPath(
  candidate: string | null | undefined,
  allowedRoots: readonly string[],
): string | null {
  if (!isSafeInternalPath(candidate, allowedRoots)) {
    return null;
  }

  try {
    const url = new URL(candidate!, 'https://aerobook.local');
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}
