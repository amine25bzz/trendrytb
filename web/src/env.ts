/**
 * Validated build-time configuration. The only module that reads `import.meta.env`.
 *
 * Every VITE_* value is public (it ships in the browser bundle), so nothing here may be a secret.
 */

export interface AppEnv {
  /** Backend origin without a trailing slash; '' means same origin (dev proxy). */
  readonly apiBase: string;
}

export class EnvError extends Error {
  override readonly name = 'EnvError';
}

interface RawEnv {
  readonly VITE_API_BASE?: string | undefined;
}

export function parseEnv(raw: RawEnv): AppEnv {
  return { apiBase: parseApiBase(raw.VITE_API_BASE) };
}

function parseApiBase(value: string | undefined): string {
  const trimmed = (value ?? '').trim();
  if (trimmed === '') return '';

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    throw new EnvError(
      `VITE_API_BASE must be empty or an absolute http(s) URL such as http://localhost:3000; got "${trimmed}".`,
    );
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new EnvError(`VITE_API_BASE must use http or https; got "${url.protocol}".`);
  }
  if (url.search !== '' || url.hash !== '' || url.username !== '' || url.password !== '') {
    throw new EnvError('VITE_API_BASE must not contain credentials, a query string or a fragment.');
  }
  return url.href.replace(/\/+$/, '');
}

export const env: AppEnv = parseEnv(import.meta.env);
