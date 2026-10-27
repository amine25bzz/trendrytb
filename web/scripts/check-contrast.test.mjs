import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkContrast } from './check-contrast.mjs';

const tokensCss = `:root { --color-ink: #1a1814; --color-paper: #f3efe6; --color-pale: #d8d2c3; --color-heat: #c2361b; --color-wash: #f6e1d8; }`;

test('a pair below its threshold fails', () => {
  const { problems } = checkContrast({
    tokensCss,
    pairs: [{ fg: 'color-pale', bg: 'color-paper', use: 'text' }],
  });
  assert.equal(problems.length, 1);
  assert.match(problems[0], /color-pale on color-paper: 1\.31 < 4\.5 \(text\)/);
});

test('a passing pair passes and reports its ratio', () => {
  const { problems, rows } = checkContrast({
    tokensCss,
    pairs: [{ fg: 'color-ink', bg: 'color-paper', use: 'text' }],
  });
  assert.deepEqual(problems, []);
  assert.equal(rows[0].ratio, '15.44');
});

test('an unknown token fails', () => {
  const { problems } = checkContrast({
    tokensCss,
    pairs: [{ fg: 'color-nope', bg: 'color-paper', use: 'ui' }],
  });
  assert.match(problems[0], /unknown token \(color-nope\)/);
});

test('using a forbidden-text pair in one CSS rule fails', () => {
  const pairs = [{ fg: 'color-heat', bg: 'color-wash', use: 'forbidden-text' }];
  const cssFiles = [
    {
      file: 'Row.module.css',
      css: '.new {\n  color: var(--color-heat);\n  background-color: var(--color-wash);\n}\n',
    },
  ];
  const { problems } = checkContrast({ tokensCss, pairs, cssFiles });
  assert.match(problems[0], /Row\.module\.css:1: forbidden text pair color-heat on color-wash/);
  assert.deepEqual(checkContrast({ tokensCss, pairs, cssFiles: [] }).problems, []);
});

test('the project tokens and declared pairs pass (exit 0)', () => {
  const script = fileURLToPath(new URL('./check-contrast.mjs', import.meta.url));
  const r = spawnSync(process.execPath, [script], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /check:contrast OK/);
});
