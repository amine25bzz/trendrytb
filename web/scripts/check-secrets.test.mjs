import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('./check-secrets.mjs', import.meta.url));
const dirs = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

function runOn(files) {
  const dir = mkdtempSync(join(tmpdir(), 'tr-secrets-'));
  dirs.push(dir);
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return spawnSync(process.execPath, [script, dir], { encoding: 'utf8' });
}

// Names are assembled at runtime so this test file itself never trips the guard.
const name = (...parts) => ['VITE', ...parts].join('_');

test('passes on a clean directory', () => {
  const r = runOn({ '.env': `${name('API', 'BASE')}=http://localhost:3000\n` });
  assert.equal(r.status, 0, r.stderr);
});

for (const word of ['KEY', 'SECRET', 'TOKEN', 'PASSWORD']) {
  test(`fails when an env file defines a VITE_* name containing ${word}`, () => {
    const r = runOn({ '.env.local': `${name('API', word)}=x\n` });
    assert.notEqual(r.status, 0);
    assert.match(r.stderr, /secret-like public variable name/);
  });
}

test('fails when source code reads a secret-like VITE_* name', () => {
  const r = runOn({ 'a.ts': `const k = import.meta.env.${name('YOUTUBE', 'KEY')};\n` });
  assert.notEqual(r.status, 0);
});

test('fails on a Google API key pattern and never prints the value', () => {
  const fake = 'AIza' + 'x'.repeat(35);
  const r = runOn({ 'config.json': `{"k":"${fake}"}\n` });
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /value hidden/);
  assert.ok(!r.stderr.includes(fake) && !r.stdout.includes(fake));
});
