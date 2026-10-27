// Copies the self-hosted font files from the pinned @fontsource packages into public/fonts/.
//   node scripts/vendor-fonts.mjs          copy (run after changing FONT_FILES or a package version)
//   node scripts/vendor-fonts.mjs --check  exit 1 if public/fonts differs from the packages
// Only the weights and subsets listed here ship. See FONTS.md.
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
export const OUT_DIR = join(root, 'public', 'fonts');

/** [package, file inside the package's files/ folder] */
export const FONT_FILES = [
  ['@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-400-normal.woff2'],
  ['@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-500-normal.woff2'],
  ['@fontsource/ibm-plex-sans', 'ibm-plex-sans-latin-600-normal.woff2'],
  ['@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-arabic-400-normal.woff2'],
  ['@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-arabic-500-normal.woff2'],
  ['@fontsource/ibm-plex-sans-arabic', 'ibm-plex-sans-arabic-arabic-600-normal.woff2'],
  ['@fontsource/ibm-plex-sans-condensed', 'ibm-plex-sans-condensed-latin-600-normal.woff2'],
];
const LICENSE = ['@fontsource/ibm-plex-sans', 'LICENSE', 'LICENSE-IBM-Plex-OFL.txt'];

const pkgDir = (pkg) => dirname(require.resolve(`${pkg}/package.json`));
const sources = () => [
  ...FONT_FILES.map(([pkg, file]) => [join(pkgDir(pkg), 'files', file), join(OUT_DIR, file)]),
  [join(pkgDir(LICENSE[0]), LICENSE[1]), join(OUT_DIR, LICENSE[2])],
];

export function differences() {
  return sources()
    .filter(([src, dest]) => !existsSync(dest) || !readFileSync(src).equals(readFileSync(dest)))
    .map(([, dest]) => dest);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  if (process.argv.includes('--check')) {
    const diff = differences();
    if (diff.length) {
      console.error(`vendor-fonts --check FAILED; out of date:\n  ${diff.join('\n  ')}`);
      process.exit(1);
    }
    console.log('vendor-fonts --check OK');
  } else {
    mkdirSync(OUT_DIR, { recursive: true });
    for (const [src, dest] of sources()) copyFileSync(src, dest);
    console.log(`Copied ${sources().length} files to ${OUT_DIR}`);
  }
}
