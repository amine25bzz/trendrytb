// Fails unless the running Node.js has the major version pinned in .nvmrc.
// A different minor/patch passes with a warning so the phase report can state the actual version.
import { readFileSync } from 'node:fs';

const expected = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim();
const actual = process.versions.node;
const major = (v) => v.split('.')[0];

if (major(actual) !== major(expected)) {
  console.error(
    `check:node FAILED: Node ${expected} is required (see web/.nvmrc), but this is Node ${actual}.\n` +
      `Run "nvm use" (or "nvm install ${expected}") in web/ and try again.`,
  );
  process.exit(1);
}
if (actual !== expected) {
  console.warn(`check:node WARNING: expected Node ${expected}, running ${actual} (same major).`);
} else {
  console.log(`check:node OK: Node ${actual}`);
}
