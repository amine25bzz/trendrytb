import { describe, expect, it } from 'vitest';
import { EnvError, parseEnv } from './env';

describe('parseEnv', () => {
  it('treats a missing or empty VITE_API_BASE as same origin', () => {
    expect(parseEnv({}).apiBase).toBe('');
    expect(parseEnv({ VITE_API_BASE: '' }).apiBase).toBe('');
    expect(parseEnv({ VITE_API_BASE: '   ' }).apiBase).toBe('');
  });

  it('accepts an absolute http(s) URL and removes the trailing slash', () => {
    expect(parseEnv({ VITE_API_BASE: 'http://localhost:3000' }).apiBase).toBe(
      'http://localhost:3000',
    );
    expect(parseEnv({ VITE_API_BASE: 'https://api.example.com/base/' }).apiBase).toBe(
      'https://api.example.com/base',
    );
  });

  it('rejects a malformed URL with a clear message', () => {
    expect(() => parseEnv({ VITE_API_BASE: 'localhost:3000/api' })).toThrow(EnvError);
    expect(() => parseEnv({ VITE_API_BASE: 'not a url' })).toThrow(
      /VITE_API_BASE must be empty or an absolute http\(s\) URL/,
    );
  });

  it('rejects non-http protocols, credentials and query strings', () => {
    expect(() => parseEnv({ VITE_API_BASE: 'ftp://example.com' })).toThrow(/http or https/);
    expect(() => parseEnv({ VITE_API_BASE: 'https://user:pw@example.com' })).toThrow(/credentials/);
    expect(() => parseEnv({ VITE_API_BASE: 'https://example.com/?key=x' })).toThrow(/query string/);
  });
});
