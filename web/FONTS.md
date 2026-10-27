# Fonts

All fonts are self-hosted from `public/fonts/`. No font request leaves the site's origin.

| Family                  | Weights       | Subset                       | File(s)                                                  | Bytes                    |
| ----------------------- | ------------- | ---------------------------- | -------------------------------------------------------- | ------------------------ |
| IBM Plex Sans           | 400, 500, 600 | Latin (incl. French accents) | `ibm-plex-sans-latin-{400,500,600}-normal.woff2`         | 22,588 / 24,184 / 24,252 |
| IBM Plex Sans Arabic    | 400, 500, 600 | Arabic                       | `ibm-plex-sans-arabic-arabic-{400,500,600}-normal.woff2` | 42,848 / 45,296 / 45,688 |
| IBM Plex Sans Condensed | 600           | Latin                        | `ibm-plex-sans-condensed-latin-600-normal.woff2`         | 19,816                   |

Total shipped: 224,672 bytes (7 files). A browser downloads only the faces a page actually uses;
the Arabic files load only when Arabic text is on screen (`unicode-range` in `src/styles/fonts.css`).
`index.html` preloads Plex Sans 400 and Plex Sans Condensed 600.

## Source and license

- Source: the `@fontsource/ibm-plex-sans`, `@fontsource/ibm-plex-sans-arabic` and
  `@fontsource/ibm-plex-sans-condensed` npm packages, version 5.3.0 (pinned devDependencies).
- License: **SIL Open Font License 1.1**, Copyright IBM Corp. The full text ships next to the
  fonts as `public/fonts/LICENSE-IBM-Plex-OFL.txt`, as the license requires.

## Updating

1. Change the package version(s) or the list in `scripts/vendor-fonts.mjs`.
2. Run `npm run fonts:vendor`.
3. Update the `@font-face` rules in `src/styles/fonts.css` and this file.

`scripts/vendor-fonts.test.mjs` (part of `npm run check`) fails if `public/fonts/` drifts from the
pinned packages.

## Tabular figures

The shipped subsets contain no `tnum` OpenType feature, but every Latin digit in each shipped weight
has the same advance width (checked with fontTools during P01, and in the browser by the specimen
e2e test), so number columns align by digit. `font-variant-numeric: tabular-nums` is still set on
numeric text so a future font change keeps the intent. IBM Plex Mono is therefore not shipped.

Arabic UI uses Latin digits (decision P5); in Arabic text the digits come from IBM Plex Sans.
