import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkCss } from './check-css.mjs';

const fixtures = fileURLToPath(new URL('./fixtures/css/', import.meta.url));
const tmp = [];
after(() => tmp.forEach((d) => rmSync(d, { recursive: true, force: true })));

/** Copies tokens.css plus one bad fixture into a temp src dir and checks only that. */
function checkOne(fixture) {
  const dir = mkdtempSync(join(tmpdir(), 'tr-css-'));
  tmp.push(dir);
  cpSync(join(fixtures, 'bad', 'styles'), join(dir, 'styles'), { recursive: true });
  cpSync(join(fixtures, 'bad', fixture), join(dir, fixture));
  return checkCss(dir).problems;
}

test('clean fixture passes (logical props, tokens, local custom property, physical: opt-out)', () => {
  assert.deepEqual(checkCss(join(fixtures, 'clean')).problems, []);
});

const cases = [
  ['MarginLeft.module.css', /MarginLeft\.module\.css:2: physical property "margin-left"/],
  ['Important.module.css', /Important\.module\.css:2: !important is not allowed/],
  ['RawHex.module.css', /RawHex\.module\.css:2: raw color in "color: #fff"/],
  ['UndefinedVar.module.css', /UndefinedVar\.module\.css:2: var\(--color-nope\) is not defined/],
  ['RawFontSize.module.css', /RawFontSize\.module\.css:2: raw font-size "14px"/],
  ['TextAlign.module.css', /physical value "text-align: right"/],
  ['FourValue.module.css', /4-value "padding" with different left\/right/],
  ['NamedColor.module.css', /raw color in "border-color: white"/],
  ['ColorFn.module.css', /raw color in "background: rgb\(/],
];
for (const [file, expected] of cases) {
  test(`fails with a specific message: ${file}`, () => {
    const problems = checkOne(file);
    assert.equal(problems.length, 1, problems.join('\n'));
    assert.match(problems[0], expected);
  });
}

test('raw colors are allowed inside styles/tokens.css', () => {
  const problems = checkOne('MarginLeft.module.css'); // tokens.css with hex values is in the same dir
  assert.ok(problems.every((p) => !p.includes('tokens.css')));
});
