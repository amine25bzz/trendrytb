/**
 * Design specimen (P01): a static page that shows the design tokens, fonts, icons and a sample
 * ruled table so the design identity can be reviewed before any component exists.
 * Dev server only, or a build with VITE_SPECIMEN=1. No data, no API.
 */
import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from 'react';
import { allIcons, IconArrowDown, IconArrowUp, type IconProps } from '@/icons';
import { contrastRatio, formatRatio, parseHex } from '@/lib/contrast';
import contrastManifest from '@/styles/contrast-pairs.json';
import styles from './Specimen.module.css';
import { SPECIMEN_LANGS, SPECIMEN_TEXT, toSpecimenLang, type SpecimenLang } from './specimenText';

const THRESHOLDS: Record<string, number | undefined> = { text: 4.5, 'large-text': 3, ui: 3 };

const TYPE_SCALE = [
  { token: '--text-xs', size: '0.75rem', className: styles.textXs },
  { token: '--text-sm', size: '0.875rem', className: styles.textSm },
  { token: '--text-md', size: '1rem', className: styles.textMd },
  { token: '--text-lg', size: '1.25rem', className: styles.textLg },
  { token: '--text-xl', size: '1.75rem', className: styles.textXl },
] as const;

const SPACING = [1, 2, 3, 4, 5, 6, 7, 8] as const;

const COLOR_TOKENS = [
  'color-paper',
  'color-surface',
  'color-ink',
  'color-ink-muted',
  'color-ink-faint',
  'color-rule',
  'color-heat',
  'color-heat-strong',
  'color-on-heat',
  'color-heat-wash',
  'color-error',
  'color-notice',
] as const;

const SAMPLE_VIEWS = [12_804_377, 1_284_903, 998, 45_210, 7, 310_552] as const;

const TABLE_ROWS = [
  { rank: 1, views: 12_804_377, move: { kind: 'up', n: 4 }, countries: ['US 1', 'GB 2', 'MA 5'] },
  { rank: 3, views: 1_284_903, move: { kind: 'down', n: 2 }, countries: ['FR 3', 'MA 7'] },
  { rank: 14, views: 45_210, move: { kind: 'new', n: 0 }, countries: ['SA 14'] },
] as const;

function useSpecimenLang(): SpecimenLang {
  const lang = toSpecimenLang(new URLSearchParams(window.location.search).get('lang'));
  useEffect(() => {
    const html = document.documentElement;
    const previous = { lang: html.lang, dir: html.dir, title: document.title };
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.title = `${SPECIMEN_TEXT[lang].title} · TrendRadar`;
    return () => {
      html.lang = previous.lang;
      html.dir = previous.dir;
      document.title = previous.title;
    };
  }, [lang]);
  return lang;
}

/**
 * Reads the token values the browser actually computed, so the page shows what ships.
 * Stylesheets are imported before the first render (main.tsx), so reading once is enough.
 */
function readComputedColors(): Record<string, string> {
  const style = getComputedStyle(document.documentElement);
  return Object.fromEntries(COLOR_TOKENS.map((t) => [t, style.getPropertyValue(`--${t}`).trim()]));
}

function ratioOf(colors: Record<string, string>, fg: string, bg: string): number | null {
  const a = parseHex(colors[fg] ?? '');
  const b = parseHex(colors[bg] ?? '');
  return a && b ? contrastRatio(a, b) : null;
}

export default function Specimen() {
  const lang = useSpecimenLang();
  const t = SPECIMEN_TEXT[lang];
  const [colors] = useState(readComputedColors);
  const number = useMemo(() => new Intl.NumberFormat(`${lang}-u-nu-latn`), [lang]);

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <p className={styles.kicker}>TrendRadar</p>
        <h1>{t.title}</h1>
        <p className={styles.note}>{t.note}</p>
        <nav aria-label={t.languages} className={styles.langs}>
          <span className={styles.label}>{t.languages}</span>
          <ul role="list" className={styles.langList}>
            {SPECIMEN_LANGS.map((l) => (
              <li key={l}>
                <a
                  href={`?lang=${l}`}
                  lang={l}
                  aria-current={l === lang ? 'page' : undefined}
                  className={styles.langLink}
                >
                  {SPECIMEN_TEXT[l].languageName}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className={styles.main}>
        <Section title={t.sections.type}>
          <dl className={styles.typeScale}>
            {TYPE_SCALE.map((row) => (
              <div key={row.token} className={styles.typeRow}>
                <dt className={styles.meta}>
                  <code dir="ltr">{row.token}</code>{' '}
                  <span className="tabular-nums">{row.size}</span>
                </dt>
                <dd className={row.className}>{t.sampleHeadline}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.body}>{t.sampleBody}</p>
          <p className={styles.weights}>
            <span className={styles.w400}>Plex Sans 400</span>
            <span className={styles.w500}>Plex Sans 500</span>
            <span className={styles.w600}>Plex Sans 600</span>
            <span className={styles.condensed}>Plex Sans Condensed 600</span>
          </p>
        </Section>

        <Section title={t.sections.mixed}>
          <ul role="list" className={styles.mixedList}>
            {t.mixedSamples.map(({ channel, line }) => {
              const [before, after] = line.split('{channel}');
              return (
                <li key={line} className={styles.mixedItem}>
                  {before}
                  {after !== undefined ? <bdi>{channel}</bdi> : null}
                  {after}
                </li>
              );
            })}
          </ul>
        </Section>

        <Section title={t.sections.color}>
          <ul role="list" className={styles.swatches}>
            {COLOR_TOKENS.map((token) => (
              <li key={token} className={styles.swatch}>
                <span
                  className={styles.chip}
                  style={{ backgroundColor: `var(--${token})` }}
                  aria-hidden="true"
                />
                <code className={styles.tokenName} dir="ltr">
                  --{token}
                </code>
                <code className={styles.meta} dir="ltr">
                  {colors[token] ?? ''}
                </code>
              </li>
            ))}
          </ul>
          <ScrollRegion label={`${t.sections.color}: ${t.color.pair}`}>
            <table className={`${styles.table} ${styles.pairTable}`}>
              <thead>
                <tr>
                  <th scope="col">{t.color.pair}</th>
                  <th scope="col">{t.color.use}</th>
                  <th scope="col" className={styles.num}>
                    {t.color.ratio}
                  </th>
                  <th scope="col" className={styles.num}>
                    {t.color.minimum}
                  </th>
                  <th scope="col">{t.color.result}</th>
                </tr>
              </thead>
              <tbody>
                {contrastManifest.pairs.map(({ fg, bg, use }) => {
                  const ratio = ratioOf(colors, fg, bg);
                  const min = THRESHOLDS[use];
                  const ok = ratio !== null && (min === undefined || ratio >= min);
                  return (
                    <tr key={`${fg}|${bg}|${use}`}>
                      <td>
                        {use === 'text' ? (
                          <span
                            className={styles.pairSample}
                            style={{ color: `var(--${fg})`, backgroundColor: `var(--${bg})` }}
                            aria-hidden="true"
                            dir="ltr"
                          >
                            Aa ع 12
                          </span>
                        ) : (
                          // Non-text pairs are shown as what they are for: a stroke, never text.
                          <span
                            className={styles.strokeSample}
                            style={{ borderColor: `var(--${fg})`, backgroundColor: `var(--${bg})` }}
                            aria-hidden="true"
                          />
                        )}{' '}
                        <code className={styles.meta} dir="ltr">
                          {fg} / {bg}
                        </code>
                      </td>
                      <td>
                        <code className={styles.meta} dir="ltr">
                          {use}
                        </code>
                      </td>
                      <td className={`${styles.num} tabular-nums`}>
                        <bdi dir="ltr">{ratio === null ? '–' : formatRatio(ratio)}</bdi>
                      </td>
                      <td className={`${styles.num} tabular-nums`}>
                        <bdi dir="ltr">{min === undefined ? '–' : min.toFixed(1)}</bdi>
                      </td>
                      <td>
                        {min === undefined ? t.color.reportOnly : ok ? t.color.pass : t.color.fail}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollRegion>
        </Section>

        <Section title={t.sections.ranks}>
          <div className={styles.rankDemo}>
            <ol role="list" className={styles.rankColumn}>
              {SAMPLE_VIEWS.map((views, i) => (
                <li key={views} className={styles.rankRow}>
                  <span className={`${styles.rank} ${i < 3 ? styles.rankTop : ''} tabular-nums`}>
                    {i + 1}
                  </span>
                  <span className={`${styles.views} tabular-nums`} data-testid="views">
                    <bdi dir="ltr">{number.format(views)}</bdi>
                  </span>
                </li>
              ))}
            </ol>
            <div className={styles.digitProof}>
              <p className={styles.meta}>{t.ranksNote}</p>
              {(
                [
                  ['sans-400', styles.w400],
                  ['sans-600', styles.w600],
                  ['condensed-600', styles.condensed],
                ] as const
              ).map(([id, cls]) => (
                <p key={id} className={`${cls} tabular-nums ${styles.digits}`} dir="ltr">
                  <span data-testid={`digits-${id}-1`}>111111</span>
                  <span data-testid={`digits-${id}-8`}>888888</span>
                </p>
              ))}
              <p className={`${styles.rankLarge} tabular-nums`}>1</p>
            </div>
          </div>
        </Section>

        <Section title={t.sections.movement}>
          <ul role="list" className={styles.movementList}>
            <li>
              <Movement kind="up" n={4} text={t.movement.up(4)} />
            </li>
            <li>
              <Movement kind="down" n={2} text={t.movement.down(2)} />
            </li>
            <li>
              <Movement kind="same" n={0} text={t.movement.same} />
            </li>
            <li>
              <Movement kind="new" n={0} text={t.movement.isNew} newTag={t.movement.newTag} />
            </li>
          </ul>
        </Section>

        <Section title={t.sections.spacing}>
          <ul role="list" className={styles.spacingList}>
            {SPACING.map((n) => (
              <li key={n} className={styles.spacingRow}>
                <code className={styles.meta} dir="ltr">
                  --space-{n}
                </code>
                <span
                  className={styles.spacingBar}
                  style={{ inlineSize: `var(--space-${n})` }}
                  aria-hidden="true"
                />
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.sections.icons}>
          <ul role="list" className={styles.iconGrid}>
            {Object.entries(allIcons).map(([name, Icon]: [string, ComponentType<IconProps>]) => (
              <li key={name} className={styles.iconCell}>
                <Icon className={styles.iconLarge} />
                <code className={styles.meta} dir="ltr">
                  {name.replace(/^Icon/, '')}
                </code>
              </li>
            ))}
          </ul>
        </Section>

        <Section title={t.sections.focus}>
          <p className={styles.meta}>{t.focusNote}</p>
          <div className={styles.focusRow}>
            <button type="button" className={styles.demoButton}>
              {t.focusButton}
            </button>
            <a href="#specimen-table">{t.focusLink}</a>
            <button type="button" className={styles.demoIconButton} aria-label={t.sections.icons}>
              <allIcons.IconMenu />
            </button>
          </div>
        </Section>

        <Section title={t.sections.table} id="specimen-table">
          <ScrollRegion label={t.table.caption}>
            <table className={`${styles.table} ${styles.chartTable}`}>
              <caption className={styles.caption}>{t.table.caption}</caption>
              <thead>
                <tr>
                  <th scope="col" className={styles.num}>
                    {t.table.rank}
                  </th>
                  <th scope="col" colSpan={2}>
                    {t.table.video}
                  </th>
                  <th scope="col" className={styles.num}>
                    {t.table.views}
                  </th>
                  <th scope="col">{t.table.published}</th>
                  <th scope="col">{t.table.countries}</th>
                </tr>
              </thead>
              <tbody>
                {TABLE_ROWS.map((row, i) => {
                  const text = t.table.rows[i];
                  const moveText =
                    row.move.kind === 'up'
                      ? t.movement.up(row.move.n)
                      : row.move.kind === 'down'
                        ? t.movement.down(row.move.n)
                        : t.movement.isNew;
                  return (
                    <tr
                      key={row.rank}
                      className={row.move.kind === 'new' ? styles.rowNew : undefined}
                    >
                      <td className={styles.rankCell}>
                        <span
                          className={`${styles.rank} ${row.rank <= 3 ? styles.rankTop : ''} tabular-nums`}
                        >
                          {row.rank}
                        </span>
                        <Movement
                          kind={row.move.kind}
                          n={row.move.n}
                          text={moveText}
                          newTag={t.movement.newTag}
                        />
                      </td>
                      <td className={styles.thumbCell}>
                        <span className={styles.thumb} aria-hidden="true" />
                      </td>
                      <td>
                        <span className={styles.videoTitle} dir="auto">
                          {text?.title}
                        </span>
                        <span className={styles.channel} dir="auto">
                          {text?.channel}
                        </span>
                      </td>
                      <td className={`${styles.num} tabular-nums`}>
                        <bdi dir="ltr">{number.format(row.views)}</bdi>
                      </td>
                      <td className={styles.meta}>{text?.age}</td>
                      <td>
                        <ul role="list" className={styles.tags}>
                          {row.countries.map((c) => (
                            <li key={c} className={styles.tag}>
                              <bdi dir="ltr" className="tabular-nums">
                                {c}
                              </bdi>
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </ScrollRegion>
        </Section>
      </main>
    </div>
  );
}

function Section({ title, id, children }: { title: string; id?: string; children: ReactNode }) {
  return (
    <section className={styles.section} aria-label={title} id={id}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {children}
    </section>
  );
}

/**
 * Wide content scrolls inside its own region at narrow widths, so the page itself never
 * scrolls sideways. A scrollable region must be reachable by keyboard (axe
 * "scrollable-region-focusable"), hence tabIndex on a labelled region.
 */
function ScrollRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- keyboard users must be able to scroll this region
    <div className={styles.scroll} role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}

function Movement({
  kind,
  n,
  text,
  newTag,
}: {
  kind: 'up' | 'down' | 'same' | 'new';
  n: number;
  text: string;
  newTag?: string;
}) {
  if (kind === 'new') {
    return (
      <span className={styles.newTag}>
        <span aria-hidden="true">{newTag}</span>
        <span className="visually-hidden">{text}</span>
      </span>
    );
  }
  return (
    <span className={`${styles.movement} ${styles[`move_${kind}`] ?? ''}`}>
      {kind === 'up' ? <IconArrowUp /> : kind === 'down' ? <IconArrowDown /> : null}
      <span aria-hidden="true" className="tabular-nums">
        {kind === 'same' ? '–' : n}
      </span>
      <span className="visually-hidden">{text}</span>
    </span>
  );
}
