// Proves the design specimen is left out of a normal production build and included only with
// VITE_SPECIMEN=1. Runs two real Vite builds into temporary folders.
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'vite';

const root = fileURLToPath(new URL('..', import.meta.url));
const dirs = [];
after(() => dirs.forEach((d) => rmSync(d, { recursive: true, force: true })));

async function buildWith(flag) {
  const outDir = mkdtempSync(join(tmpdir(), 'tr-build-'));
  dirs.push(outDir);
  const previous = process.env.VITE_SPECIMEN;
  if (flag === undefined) delete process.env.VITE_SPECIMEN;
  else process.env.VITE_SPECIMEN = flag;
  try {
    await build({ root, logLevel: 'silent', build: { outDir, emptyOutDir: true } });
  } finally {
    if (previous === undefined) delete process.env.VITE_SPECIMEN;
    else process.env.VITE_SPECIMEN = previous;
  }
  const js = readdirSync(join(outDir, 'assets')).filter((f) => f.endsWith('.js'));
  return js.map((f) => readFileSync(join(outDir, 'assets', f), 'utf8')).join('\n');
}

test('normal production build contains no specimen code', async () => {
  const js = await buildWith(undefined);
  assert.ok(!js.includes('Design specimen'), 'specimen text found in the bundle');
  assert.ok(!js.includes('_specimen'), 'specimen route found in the bundle');
});

test('VITE_SPECIMEN=1 build includes the specimen', async () => {
  const js = await buildWith('1');
  assert.ok(js.includes('Design specimen'));
});

test('an invalid VITE_SPECIMEN value fails the build with a clear message', async () => {
  await assert.rejects(buildWith('yes'), /VITE_SPECIMEN must be empty, "0" or "1"/);
});
