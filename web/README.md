# TrendRadar web (front-end)

React + TypeScript single-page application that will replace the single-file `../index.html`.
It lives entirely in `web/`. The backend (`../server.js`), the old `../index.html`, the root
`package.json`, `README.md` and `data/` are **not** modified by this project.

Status: **P01 (design foundation)**. There is a placeholder page and a design specimen. Features arrive phase by phase.

## Requirements

- Node.js **24.11.0** (pinned in `.nvmrc` and `engines`). `npm run check:node` fails on another major version.
- For browser tests, once per machine: `npx playwright install chromium`.
- **Supported browsers:** current evergreen Chrome, Edge, Firefox and Safari (the CSS uses
  `@layer`, logical properties and `:dir()`). Only Chromium is tested automatically.

## Run it

```bash
cd web
nvm use            # or: nvm install 24.11.0
npm ci
npm run dev        # http://localhost:5173
```

### With the real backend beside it

In a second terminal, from the repository root:

```bash
# Windows PowerShell:  $env:YOUTUBE_API_KEY="<your new key>"; node server.js
# macOS / Linux:       YOUTUBE_API_KEY="<your new key>" node server.js
```

The dev server proxies `/api/*` to `http://localhost:3000` (development only), so
`http://localhost:5173/api/trends` returns the backend's JSON.

The YouTube key belongs to the **backend only**. Never commit it and never put it, or any other
secret, in a `VITE_*` variable: every `VITE_*` value is published in the browser bundle.
`npm run check:secrets` enforces this.

### Configuration

| Variable        | Required | Meaning                                                                                                        |
| --------------- | -------- | -------------------------------------------------------------------------------------------------------------- |
| `VITE_API_BASE` | no       | Absolute http(s) URL of the backend. Empty = same origin (the dev proxy). Validated at startup (`src/env.ts`). |

| `VITE_SPECIMEN` | no | `1` includes the design specimen in a production build. Empty or `0` (default) leaves it out entirely. |

See `.env.example`. Local overrides go in `.env.local` (git-ignored).

### Design specimen

`npm run dev`, then open http://localhost:5173/_specimen (add `?lang=fr` or `?lang=ar`).
It shows the tokens, fonts, icons and a sample ruled table. It is static: no data, no API.

## Scripts

| Command                  | What it does                                                                                                                |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`            | Vite dev server on port 5173 with the `/api` proxy                                                                          |
| `npm run build`          | Type-check, then production build to `dist/`                                                                                |
| `npm run preview`        | Serve `dist/` on port 4173                                                                                                  |
| `npm run typecheck`      | `tsc` for app code and for config/e2e code                                                                                  |
| `npm run lint`           | ESLint, including the architecture boundary rules                                                                           |
| `npm run format`         | Prettier write (`format:check` only checks)                                                                                 |
| `npm test`               | Vitest unit and component tests (jsdom)                                                                                     |
| `npm run test:scripts`   | Node tests for the guard scripts and the specimen build flag (runs two quick builds)                                        |
| `npm run test:e2e`       | Playwright tests (Chromium, own dev server on port 5174). Filter with `-- --grep @a11y`, `@visual`, `@keyboard`, `specimen` |
| `npm run check:node`     | Fails unless Node's major version matches `.nvmrc`                                                                          |
| `npm run check:secrets`  | Fails on secret-like `VITE_*` names or API-key patterns in `web/`                                                           |
| `npm run check:css`      | CSS rules: logical properties only, tokens only, no `!important`, no undefined variables                                    |
| `npm run check:contrast` | Contrast of every declared token pair in `src/styles/contrast-pairs.json`                                                   |
| `npm run fonts:vendor`   | Copy the pinned IBM Plex files into `public/fonts/` (see `FONTS.md`)                                                        |
| `npm run check`          | node, secrets, typecheck, lint, format:check, css, contrast, unit tests, script tests                                       |

Only Chromium is tested automatically. Other browsers are not verified.

## Conventions

- **Layout** (grows phase by phase): `src/app` (router, providers), `src/api` (ports, adapters,
  HTTP), `src/features/*`, `src/components` (presentational), `src/lib` (pure helpers),
  `src/i18n`, `src/styles`, `src/icons`, `src/mocks`. Import alias `@/` → `src/`.
- **Architecture boundaries** are enforced by ESLint (`eslint.config.js`) and proven by
  `scripts/lint-boundaries.test.mjs`:
  - only `src/api` may call `fetch`;
  - `features` may not import `api/adapters`, `api/http`, `api/client` or `mocks`;
  - `components` may not import `features`, `api` or `mocks`;
  - `lib` may not import React.
- **CSS** (plain CSS, no framework): `src/styles/tokens.css` holds every raw color, size and
  duration; `src/styles/base.css` holds the reset and element defaults in
  `@layer reset, base, components`; each component has its own CSS Module (`Button.module.css`,
  camelCase classes) wrapped in `@layer components`. Use logical properties only
  (`margin-inline-start`, `text-align: start`). A genuinely physical rule needs a
  `/* physical: <reason> */` comment. Light theme only for now.
- **Color meaning:** vermilion (`--color-heat`) means "rising" and nothing else. Falling is neutral
  ink. Color is never the only signal: pair it with a glyph and words.
- **Icons:** inline SVG components in `src/icons` (`currentColor`, hidden from assistive technology
  unless given a `title`). No icon font, icon library or emoji.
- **TypeScript** is strict, with `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`.
- **Tests** check observable behavior (roles, labels, text), never call YouTube, and are not
  retried until green: a flaky test is a finding.

## Phase workflow

Work follows the TrendRadar front-end plan (`TrendRadar-Frontend-Plan/`, phases P00 to P13).
A phase starts only when the project owner authorizes it by name, ends at its gate with a
report in `reports/Pxx.md`, and the next phase does not start until the owner accepts it.
