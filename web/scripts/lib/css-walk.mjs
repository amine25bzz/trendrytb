// Tiny CSS reader shared by check-css and check-contrast. Not a full parser: it yields the
// declarations inside rule blocks with their line numbers, which is all the guards need.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

export function listCssFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...listCssFiles(full));
    else if (name.endsWith('.css')) out.push(full);
  }
  return out.sort();
}

/**
 * Returns { rules: [{ selector, line, decls: [{ prop, value, line, allowPhysical }] }] }.
 * A declaration may opt out of the physical-property rule with a comment containing
 * "physical:" (a reason) on the same line or on the line just above it.
 */
export function parseCss(source) {
  const lines = source.split(/\r?\n/);
  const allowLines = new Set();
  lines.forEach((l, i) => {
    if (/\/\*[^*]*physical:\s*\S/.test(l)) {
      allowLines.add(i + 1);
      allowLines.add(i + 2);
    }
  });
  // Blank out comments but keep newlines so offsets still map to lines.
  const text = source.replace(/\/\*[\s\S]*?\*\//g, (c) => c.replace(/[^\n]/g, ' '));
  const lineAt = (idx) => text.slice(0, idx).split('\n').length;

  const rules = [];
  const stack = [];
  let buf = '';
  let bufStart = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') {
      const selector = buf.trim();
      const rule = {
        selector,
        line: lineAt(bufStart + (buf.length - buf.trimStart().length)),
        decls: [],
      };
      rules.push(rule);
      stack.push(rule);
      buf = '';
      bufStart = i + 1;
    } else if (ch === ';' || ch === '}') {
      const current = stack[stack.length - 1];
      const decl = buf.trim();
      if (current && decl && !decl.startsWith('@')) {
        const colon = decl.indexOf(':');
        if (colon > 0) {
          const line = lineAt(bufStart + (buf.length - buf.trimStart().length));
          current.decls.push({
            prop: decl.slice(0, colon).trim().toLowerCase(),
            value: decl.slice(colon + 1).trim(),
            line,
            allowPhysical: allowLines.has(line),
          });
        }
      }
      if (ch === '}') stack.pop();
      buf = '';
      bufStart = i + 1;
    } else {
      buf += ch;
    }
  }
  return { rules };
}

export function readCss(file) {
  return parseCss(readFileSync(file, 'utf8'));
}
