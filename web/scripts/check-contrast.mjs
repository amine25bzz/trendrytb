// Contrast check (P01 task 6). Usage:
//   node scripts/check-contrast.mjs [--tokens file] [--pairs file] [--css-dir dir]
// Reads color tokens from tokens.css, computes the WCAG ratio of every declared pair and fails
// below its threshold. "forbidden-text" pairs must stay forbidden: the check fails if any CSS
// rule sets that token as `color` together with that background token.
// Limitation: only same-rule combinations are detected, not inherited colors.
import { readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { contrastRatio, formatRatio, parseHex } from '../src/lib/contrast.ts';
import { listCssFiles, parseCss } from './lib/css-walk.mjs';

export const THRESHOLDS = { text: 4.5, 'large-text': 3, ui: 3 };

export function readColorTokens(tokensCss) {
  const tokens = new Map();
  for (const rule of parseCss(tokensCss).rules) {
    if (rule.selector !== ':root') continue; // light theme values only
    for (const d of rule.decls) {
      const rgb = d.prop.startsWith('--color-') ? parseHex(d.value) : null;
      if (rgb) tokens.set(d.prop.slice(2), rgb);
    }
  }
  return tokens;
}

export function checkContrast({ tokensCss, pairs, cssFiles = [] }) {
  const tokens = readColorTokens(tokensCss);
  const rows = [];
  const problems = [];
  for (const { fg, bg, use } of pairs) {
    const a = tokens.get(fg);
    const b = tokens.get(bg);
    if (!a || !b) {
      problems.push(`${fg} on ${bg}: unknown token (${!a ? fg : bg})`);
      continue;
    }
    const ratio = contrastRatio(a, b);
    const min = THRESHOLDS[use];
    const ok = min === undefined || ratio >= min;
    rows.push({ fg, bg, use, ratio: formatRatio(ratio), min: min ?? '-', ok });
    if (!ok) problems.push(`${fg} on ${bg}: ${formatRatio(ratio)} < ${min} (${use})`);
  }
  const forbidden = pairs.filter((p) => p.use === 'forbidden-text');
  for (const { file, css } of cssFiles) {
    for (const rule of parseCss(css).rules) {
      const val = (props) =>
        rule.decls
          .filter((d) => props.includes(d.prop))
          .map((d) => d.value)
          .join(' ');
      const color = val(['color']);
      const background = val(['background', 'background-color']);
      for (const { fg, bg } of forbidden) {
        if (color.includes(`var(--${fg})`) && background.includes(`var(--${bg})`)) {
          problems.push(`${file}:${rule.line}: forbidden text pair ${fg} on ${bg}`);
        }
      }
    }
  }
  return { rows, problems };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const here = (p) => fileURLToPath(new URL(p, import.meta.url));
  const { values } = parseArgs({
    options: {
      tokens: { type: 'string', default: here('../src/styles/tokens.css') },
      pairs: { type: 'string', default: here('../src/styles/contrast-pairs.json') },
      'css-dir': { type: 'string', default: here('../src') },
    },
  });
  const cssDir = resolve(values['css-dir']);
  const { rows, problems } = checkContrast({
    tokensCss: readFileSync(values.tokens, 'utf8'),
    pairs: JSON.parse(readFileSync(values.pairs, 'utf8')).pairs,
    cssFiles: listCssFiles(cssDir).map((f) => ({
      file: relative(cssDir, f),
      css: readFileSync(f, 'utf8'),
    })),
  });
  for (const r of rows) {
    console.log(
      `${r.ok ? 'ok  ' : 'FAIL'} ${r.ratio.padStart(5)}  min ${String(r.min).padEnd(3)}  ${r.use.padEnd(14)} ${r.fg} on ${r.bg}`,
    );
  }
  if (problems.length) {
    console.error(`check:contrast FAILED (${problems.length}):\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`check:contrast OK: ${rows.length} pairs`);
}
