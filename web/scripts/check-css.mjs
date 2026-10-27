// CSS rules for the project (plan 02 §4, P01 task 5). Usage: node scripts/check-css.mjs [srcDir]
//
// Fails on, in any CSS file under src/:
//   - physical inline-direction properties/values (margin-left, right:, text-align: left, ...)
//     unless the line (or the line above) has a comment "/* physical: <reason> */";
//   - !important;
//   - raw color literals or raw font sizes outside styles/tokens.css;
//   - var(--x) referencing a custom property defined neither in tokens.css nor in the same file.
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listCssFiles, readCss } from './lib/css-walk.mjs';

const PHYSICAL_PROPS =
  /^(?:margin|padding|border|scroll-margin|scroll-padding)-(?:left|right)(?:-[a-z]+)?$|^(?:left|right)$|^border-(?:top|bottom)-(?:left|right)-radius$/;
const PHYSICAL_VALUES = {
  'text-align': /^(?:left|right)\b/,
  float: /^(?:left|right)\b/,
  clear: /^(?:left|right)\b/,
};
const FOUR_VALUE_SHORTHANDS = new Set([
  'margin',
  'padding',
  'border-width',
  'border-style',
  'border-color',
]);
const HEX = /#[0-9a-f]{3,8}\b/i;
const COLOR_FN = /\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\(/i;
const NAMED =
  /(?:^|[\s,(])(white|black|red|green|blue|yellow|orange|purple|pink|gr[ae]y|silver|maroon|navy|teal|olive|lime|aqua|fuchsia|brown|gold)(?=$|[\s,)])/i;
const COLORISH = /color|background|border|outline|fill|stroke|shadow|caret|accent|decoration/;
const FONT_SIZE_KEYWORDS = /^(?:inherit|initial|unset|revert|revert-layer)$/;

export function checkCss(srcDir) {
  const files = listCssFiles(srcDir);
  const tokensFile = files.find((f) => f.endsWith(`${sep}styles${sep}tokens.css`));
  const defined = (parsed) =>
    new Set(
      parsed.rules.flatMap((r) =>
        r.decls.filter((d) => d.prop.startsWith('--')).map((d) => d.prop),
      ),
    );
  const globalTokens = tokensFile ? defined(readCss(tokensFile)) : new Set();

  const problems = [];
  for (const file of files) {
    const isTokens = file === tokensFile;
    const parsed = readCss(file);
    const local = defined(parsed);
    const at = (d) => `${relative(srcDir, file)}:${d.line}`;
    for (const rule of parsed.rules) {
      if (rule.selector.startsWith('@font-face')) continue; // font descriptors, not styles
      for (const d of rule.decls) {
        const v = d.value;
        if (/!\s*important/i.test(v))
          problems.push(`${at(d)}: !important is not allowed (use @layer order)`);

        if (!d.allowPhysical) {
          if (PHYSICAL_PROPS.test(d.prop)) {
            problems.push(
              `${at(d)}: physical property "${d.prop}"; use the logical equivalent (inline-start/end)`,
            );
          } else if (PHYSICAL_VALUES[d.prop]?.test(v)) {
            problems.push(`${at(d)}: physical value "${d.prop}: ${v}"; use start/end`);
          } else if (FOUR_VALUE_SHORTHANDS.has(d.prop)) {
            const parts = v.split(/\s+(?![^(]*\))/);
            if (parts.length === 4 && parts[1] !== parts[3]) {
              problems.push(
                `${at(d)}: 4-value "${d.prop}" with different left/right; use ${d.prop}-inline/-block`,
              );
            }
          }
        }

        if (!isTokens) {
          if (
            !d.prop.startsWith('--') &&
            (HEX.test(v) || COLOR_FN.test(v) || (COLORISH.test(d.prop) && NAMED.test(v)))
          ) {
            problems.push(
              `${at(d)}: raw color in "${d.prop}: ${v}"; use a color token from tokens.css`,
            );
          }
          if (
            d.prop === 'font-size' &&
            !(/^var\(--[\w-]+\)$/.test(v) || FONT_SIZE_KEYWORDS.test(v))
          ) {
            problems.push(`${at(d)}: raw font-size "${v}"; use a --text-* token`);
          }
        }

        for (const m of v.matchAll(/var\(\s*(--[\w-]+)/g)) {
          const name = m[1];
          if (!globalTokens.has(name) && !local.has(name)) {
            problems.push(`${at(d)}: var(${name}) is not defined in tokens.css or in this file`);
          }
        }
      }
    }
  }
  return { files: files.length, problems };
}

const isMain = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const srcDir = resolve(process.argv[2] ?? fileURLToPath(new URL('../src', import.meta.url)));
  const { files, problems } = checkCss(srcDir);
  if (problems.length) {
    console.error(`check:css FAILED (${problems.length}):\n  ${problems.join('\n  ')}`);
    process.exit(1);
  }
  console.log(`check:css OK: ${files} CSS file(s) under ${srcDir}`);
}
