import assert from 'node:assert/strict';
import { test } from 'node:test';
import { differences } from './vendor-fonts.mjs';

test('public/fonts matches the pinned @fontsource packages byte for byte', () => {
  assert.deepEqual(differences(), []);
});
