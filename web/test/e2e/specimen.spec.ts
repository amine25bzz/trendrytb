import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

const LANGS = ['en', 'fr', 'ar'] as const;
const WIDTHS = [360, 768, 1024, 1440] as const;
const OUT = join(import.meta.dirname, '..', '..', 'reports', 'P01');

const FONTS_BY_LANG: Record<(typeof LANGS)[number], string[]> = {
  en: [
    '400 16px "IBM Plex Sans"',
    '500 16px "IBM Plex Sans"',
    '600 16px "IBM Plex Sans"',
    '600 16px "IBM Plex Sans Condensed"',
  ],
  fr: [
    '400 16px "IBM Plex Sans"',
    '600 16px "IBM Plex Sans"',
    '600 16px "IBM Plex Sans Condensed"',
  ],
  ar: [
    '400 16px "IBM Plex Sans Arabic"',
    '600 16px "IBM Plex Sans Arabic"',
    '400 16px "IBM Plex Sans"',
    '600 16px "IBM Plex Sans Condensed"',
  ],
};

interface Watch {
  errors: string[];
  foreign: string[];
  fontBytes: Map<string, number>;
}

async function open(page: Page, lang: string): Promise<Watch> {
  const watch: Watch = { errors: [], foreign: [], fontBytes: new Map() };
  page.on('console', (m) => m.type() === 'error' && watch.errors.push(`console: ${m.text()}`));
  page.on('pageerror', (e) => watch.errors.push(`pageerror: ${e.message}`));
  page.on('request', (r) => {
    const url = new URL(r.url());
    if (!['localhost', '127.0.0.1'].includes(url.hostname) && url.protocol !== 'data:')
      watch.foreign.push(r.url());
  });
  page.on('response', (r) => {
    if (r.status() >= 400) watch.errors.push(`http ${r.status()}: ${r.url()}`);
    // Only fresh 200 responses have a body; cached (304) font loads are skipped.
    if (r.url().endsWith('.woff2') && r.status() === 200) {
      const name = r.url().split('/').pop() ?? r.url();
      r.body().then(
        (b) => watch.fontBytes.set(name, b.length),
        () => undefined,
      );
    }
  });
  await page.goto(`/_specimen?lang=${lang}`);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return watch;
}

for (const lang of LANGS) {
  test.describe(`specimen ${lang}`, () => {
    test(`specimen ${lang}: loads with lang/dir set, no errors, no request leaves the origin`, async ({
      page,
    }) => {
      const watch = await open(page, lang);
      await expect(page.locator('html')).toHaveAttribute('lang', lang);
      await expect(page.locator('html')).toHaveAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      await page.waitForLoadState('networkidle');
      expect(watch.errors).toEqual([]);
      expect(watch.foreign).toEqual([]);
      mkdirSync(OUT, { recursive: true });
      writeFileSync(
        join(OUT, `font-bytes-${lang}.json`),
        JSON.stringify(Object.fromEntries(watch.fontBytes), null, 2),
      );
    });

    test(`specimen ${lang}: self-hosted fonts are loaded`, async ({ page }) => {
      await open(page, lang);
      const result = await page.evaluate((specs) => {
        const loaded = [...document.fonts]
          .filter((f) => f.status === 'loaded')
          .map((f) => `${f.weight} ${f.family.replaceAll('"', '')}`);
        return { loaded, checks: specs.map((s) => [s, document.fonts.check(s)] as const) };
      }, FONTS_BY_LANG[lang]);
      for (const spec of FONTS_BY_LANG[lang]) {
        const [weight, , ...family] = spec.split(' ');
        expect(result.loaded, `${spec} should be loaded`).toContain(
          `${weight} ${family.join(' ').replaceAll('"', '')}`,
        );
      }
      expect(result.checks.every(([, ok]) => ok)).toBe(true);
    });

    test(`specimen ${lang}: numerals are tabular (equal digit widths, tabular-nums applied)`, async ({
      page,
    }) => {
      await open(page, lang);
      const variant = await page
        .getByTestId('views')
        .first()
        .evaluate((el) => getComputedStyle(el).fontVariantNumeric);
      expect(variant).toContain('tabular-nums');
      for (const id of ['sans-400', 'sans-600', 'condensed-600']) {
        const ones = await page.getByTestId(`digits-${id}-1`).boundingBox();
        const eights = await page.getByTestId(`digits-${id}-8`).boundingBox();
        expect(ones && eights, id).toBeTruthy();
        expect(
          Math.abs((ones?.width ?? 0) - (eights?.width ?? 1)),
          `${id}: 111111 vs 888888 width`,
        ).toBeLessThan(0.5);
      }
    });

    test(`@a11y specimen ${lang}: axe finds no serious or critical violations`, async ({
      page,
    }) => {
      await open(page, lang);
      const results = await new AxeBuilder({ page }).analyze();
      const bad = results.violations.filter(
        (v) => v.impact === 'serious' || v.impact === 'critical',
      );
      mkdirSync(OUT, { recursive: true });
      writeFileSync(
        join(OUT, `axe-${lang}.json`),
        JSON.stringify(
          results.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.map((n) => ({ target: n.target.join(' '), summary: n.failureSummary })),
          })),
          null,
          2,
        ),
      );
      expect(bad.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} node(s)`)).toEqual([]);
    });

    test(`@keyboard specimen ${lang}: every Tab stop shows the 2px ink focus ring`, async ({
      page,
    }) => {
      await open(page, lang);
      const seen: string[] = [];
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const s = getComputedStyle(el);
          return {
            tag: el.tagName,
            label: el.getAttribute('aria-label') ?? el.textContent?.trim().slice(0, 20) ?? '',
            style: s.outlineStyle,
            width: s.outlineWidth,
          };
        });
        if (!info) break;
        seen.push(`${info.tag}:${info.label}`);
        expect(info, `${info.tag} ${info.label}`).toMatchObject({ style: 'solid', width: '2px' });
      }
      expect(seen.length).toBeGreaterThanOrEqual(6);
    });

    for (const width of WIDTHS) {
      test(`@visual specimen ${lang} ${width}px: no horizontal page scroll; screenshot`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await open(page, lang);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow, 'page must not scroll sideways').toBeLessThanOrEqual(0);
        await page.screenshot({
          path: join(OUT, 'screenshots', `specimen-${lang}-${width}.png`),
          fullPage: true,
        });
      });
    }
  });
}
