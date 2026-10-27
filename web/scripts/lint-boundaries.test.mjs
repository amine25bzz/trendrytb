// Proves the architecture boundary rules fire. Each fixture is linted *as if* it lived at a path
// inside src/, so ESLint applies that path's rules; the fixtures themselves sit outside src/.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { ESLint } from 'eslint';

const cwd = fileURLToPath(new URL('..', import.meta.url));
const eslint = new ESLint({ cwd });
const fixture = (name) => readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8');

async function ruleIds(fixtureName, virtualPath) {
  const [result] = await eslint.lintText(fixture(fixtureName), {
    filePath: `${cwd}/${virtualPath}`,
  });
  return result.messages.filter((m) => m.severity === 2).map((m) => m.ruleId ?? m.message);
}

const violations = [
  ['feature-calls-fetch.ts', 'src/features/trends/load.ts', 'no-restricted-globals'],
  ['feature-calls-window-fetch.ts', 'src/features/trends/load.ts', 'no-restricted-properties'],
  ['feature-calls-fetch.ts', 'src/components/Thing.ts', 'no-restricted-globals'],
  ['feature-imports-adapter.ts', 'src/features/trends/x.ts', 'no-restricted-imports'],
  ['feature-imports-mock-relative.ts', 'src/features/history/x.ts', 'no-restricted-imports'],
  ['component-imports-feature.ts', 'src/components/Table.ts', 'no-restricted-imports'],
  ['lib-imports-react.ts', 'src/lib/sort.ts', 'no-restricted-imports'],
];

for (const [name, path, rule] of violations) {
  test(`lint FAILS: ${name} at ${path} (${rule})`, async () => {
    const ids = await ruleIds(name, path);
    assert.ok(ids.includes(rule), `expected ${rule}, got [${ids.join(', ')}]`);
  });
}

test('lint passes: a feature importing only port types', async () => {
  assert.deepEqual(await ruleIds('feature-allowed.ts', 'src/features/trends/x.ts'), []);
});

test('lint passes: the API layer may call fetch', async () => {
  assert.deepEqual(await ruleIds('feature-calls-fetch.ts', 'src/api/http.ts'), []);
});
