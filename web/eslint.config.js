// ESLint flat config. The "Architecture boundaries" section encodes the dependency rule in
// plan file 02-architecture-overview.md §3. scripts/lint-boundaries.test.mjs proves it fires.
import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

/** Import specifiers in both alias (`@/x`) and relative (`../x`) form. */
const anyPathTo = (...targets) =>
  targets.flatMap((t) => [`@/${t}`, `@/${t}/*`, `**/${t}`, `**/${t}/*`]);

const NO_DIRECT_NETWORK = {
  'no-restricted-globals': [
    'error',
    { name: 'fetch', message: 'Use the API client (src/api). Only src/api may call fetch.' },
    { name: 'XMLHttpRequest', message: 'Use the API client (src/api).' },
  ],
  'no-restricted-properties': [
    'error',
    ...['window', 'globalThis', 'self'].map((object) => ({
      object,
      property: 'fetch',
      message: 'Use the API client (src/api). Only src/api may call fetch.',
    })),
  ],
};

export default tseslint.config(
  {
    ignores: [
      'dist/',
      'coverage/',
      'test-results/',
      'playwright-report/',
      'blob-report/',
      'scripts/fixtures/',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ['src/**/*.tsx'],
    ...jsxA11y.flatConfigs.recommended,
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
      // role="list" on unstyled lists keeps list semantics in Safari/VoiceOver (base.css resets them).
      'jsx-a11y/no-redundant-roles': ['error', { ul: ['list'], ol: ['list'] }],
    },
  },
  {
    files: ['scripts/**/*.mjs', '*.config.{js,ts}', 'test/e2e/**/*.ts'],
    languageOptions: { globals: globals.node },
  },

  // ---------------- Architecture boundaries ----------------
  {
    // Only the API layer talks to the network.
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/api/**'],
    rules: NO_DIRECT_NETWORK,
  },
  {
    // Features see ports and domain types only; never adapters, transport, composition root or fixtures.
    files: ['src/features/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: anyPathTo('api/adapters', 'api/http', 'api/client', 'mocks'),
              message:
                'Features may import only api/ports and api/domain (types). Data comes through hooks and the API client.',
            },
          ],
        },
      ],
    },
  },
  {
    // Shared presentational components know nothing about features or data access.
    files: ['src/components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: anyPathTo('features', 'api', 'mocks'),
              message: 'Components are presentational: no imports from features, api or mocks.',
            },
          ],
        },
      ],
    },
  },
  {
    // Pure helpers stay framework-free.
    files: ['src/lib/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react', 'react/*', 'react-dom', 'react-dom/*'],
              message: 'src/lib must not depend on React.',
            },
          ],
        },
      ],
    },
  },

  prettier,
);
