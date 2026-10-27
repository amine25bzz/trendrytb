/**
 * WCAG 2.x contrast ratio. Pure; used by scripts/check-contrast.mjs (via Node type stripping)
 * and by the design specimen, so the build check and the page show the same numbers.
 */

export type Rgb = readonly [r: number, g: number, b: number];

/** Parses #rgb or #rrggbb. Returns null for anything else. */
export function parseHex(value: string): Rgb | null {
  const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(value.trim());
  if (!m?.[1]) return null;
  const hex = m[1].length === 3 ? [...m[1]].map((c) => c + c).join('') : m[1];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as unknown as Rgb;
}

function channel(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance([r, g, b]: Rgb): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}

/** Two decimals, rounded down, so a displayed 4.50 never hides a real 4.497. */
export function formatRatio(ratio: number): string {
  return (Math.floor(ratio * 100) / 100).toFixed(2);
}
