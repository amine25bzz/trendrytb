// Secret guard for the front-end. Usage: node scripts/check-secrets.mjs [rootDir]
//
// Fails when:
//   1. a VITE_* variable name contains KEY, SECRET, TOKEN or PASSWORD (VITE_* values are public);
//   2. a Google API key pattern appears in any scanned file.
// Matched secret values are never printed; only file and line are reported.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'coverage',
  'test-results',
  'playwright-report',
  'blob-report',
  '.git',
]);
const TEXT_FILE = /\.(?:[cm]?[jt]sx?|json|html|css|md|txt|ya?ml)$|^\.env(?:\..+)?$/i;
const FORBIDDEN_VITE_NAME = /\bVITE_[A-Z0-9_]*(?:KEY|SECRET|TOKEN|PASSWORD)[A-Z0-9_]*\b/g;
const GOOGLE_API_KEY = /AIza[0-9A-Za-z_-]{35}/g;

export function findSecretProblems(rootDir) {
  const problems = [];
  for (const file of walk(rootDir)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    lines.forEach((line, i) => {
      const where = `${relative(rootDir, file) || file}:${i + 1}`;
      for (const m of line.matchAll(FORBIDDEN_VITE_NAME)) {
        problems.push(`${where}: secret-like public variable name "${m[0]}"`);
      }
      if (GOOGLE_API_KEY.test(line))
        problems.push(`${where}: looks like a Google API key (value hidden)`);
      GOOGLE_API_KEY.lastIndex = 0;
    });
  }
  return problems;
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      if (!SKIP_DIRS.has(name)) yield* walk(full);
    } else if (TEXT_FILE.test(name)) {
      yield full;
    }
  }
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const root = resolve(process.argv[2] ?? fileURLToPath(new URL('..', import.meta.url)));
  const problems = findSecretProblems(root);
  if (problems.length > 0) {
    console.error(`check:secrets FAILED (${problems.length}):\n  ${problems.join('\n  ')}`);
    console.error('Never put a secret in a VITE_* variable or in front-end files.');
    process.exit(1);
  }
  console.log(`check:secrets OK: no secret-like VITE_* names or API keys under ${root}`);
}
