import { expect, test } from '@playwright/test';

test('placeholder page loads with its heading and no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  page.on('response', (res) => {
    if (res.status() >= 400) errors.push(`http ${res.status()}: ${res.url()}`);
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { level: 1, name: 'TrendRadar' })).toBeVisible();
  expect(errors).toEqual([]);
});
