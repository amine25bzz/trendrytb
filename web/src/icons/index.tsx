/**
 * The TrendRadar icon set: hand-authored inline SVG, 24px grid, currentColor.
 * No icon font, no icon library, no emoji.
 */
import { createIcon } from './createIcon';

export type { IconProps } from './createIcon';

const solid = { fill: 'currentColor', stroke: 'none' } as const;

/** Rank movement up (solid triangle). Always paired with a signed number and text. */
export const IconArrowUp = createIcon('arrow-up', <path {...solid} d="M12 5 20 18H4Z" />);
/** Rank movement down (solid triangle). Neutral color, never alarming. */
export const IconArrowDown = createIcon('arrow-down', <path {...solid} d="M12 19 4 6h16Z" />);
/** New entry burst. */
export const IconNew = createIcon('new', <path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6 6 18" />);
export const IconSortAsc = createIcon(
  'sort-asc',
  <>
    <path {...solid} d="m12 3.5 5 6H7Z" />
    <path d="m12 20.5-5-6h10Z" strokeWidth={1.5} />
  </>,
);
export const IconSortDesc = createIcon(
  'sort-desc',
  <>
    <path d="m12 3.5 5 6H7Z" strokeWidth={1.5} />
    <path {...solid} d="m12 20.5-5-6h10Z" />
  </>,
);
export const IconSortNone = createIcon(
  'sort-none',
  <>
    <path d="m12 3.5 5 6H7Z" strokeWidth={1.5} />
    <path d="m12 20.5-5-6h10Z" strokeWidth={1.5} />
  </>,
);
export const IconSearch = createIcon(
  'search',
  <>
    <circle cx="10.5" cy="10.5" r="6.25" />
    <path d="m15.25 15.25 5.25 5.25" />
  </>,
);
export const IconClose = createIcon('close', <path d="M6 6l12 12M18 6 6 18" />);
export const IconCheck = createIcon('check', <path d="m4.5 12.5 5 5 10-11" />);
export const IconAlert = createIcon(
  'alert',
  <>
    <path d="M12 3.5 21.5 20h-19Z" />
    <path d="M12 9.5v5" />
    <circle {...solid} cx="12" cy="17.25" r="1.1" />
  </>,
);
export const IconInfo = createIcon(
  'info',
  <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M12 11v6" />
    <circle {...solid} cx="12" cy="7.75" r="1.1" />
  </>,
);
const STAR = 'M12 3.5l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.9 6.6 20l1.2-6-4.5-4.2 6.1-.7Z';
export const IconStar = createIcon('star', <path d={STAR} strokeLinejoin="round" />);
export const IconStarFilled = createIcon(
  'star-filled',
  <path d={STAR} fill="currentColor" strokeLinejoin="round" />,
);
export const IconUser = createIcon(
  'user',
  <>
    <circle cx="12" cy="8.5" r="3.75" />
    <path d="M4.5 20.5c.9-3.9 3.9-6 7.5-6s6.6 2.1 7.5 6" />
  </>,
);
export const IconLogout = createIcon(
  'logout',
  <>
    <path d="M10 4H5v16h5" />
    <path d="m15 8 4 4-4 4M9 12h10" />
  </>,
  { flipInRtl: true },
);
export const IconGlobe = createIcon(
  'globe',
  <>
    <circle cx="12" cy="12" r="8.75" />
    <ellipse cx="12" cy="12" rx="3.75" ry="8.75" />
    <path d="M3.25 12h17.5" />
  </>,
);
export const IconExternalLink = createIcon(
  'external-link',
  <path d="M14 4h6v6M20 4l-9 9M18 14v6H4V6h6" />,
);
/** Live broadcast marker. Media "play" does not mirror in RTL. */
export const IconPlay = createIcon('play', <path {...solid} d="M8 5v14l11-7Z" />);
/** Points toward the start of the line (left in LTR, right in RTL). */
export const IconChevronStart = createIcon('chevron-start', <path d="m15 5-7 7 7 7" />, {
  flipInRtl: true,
});
/** Points toward the end of the line (right in LTR, left in RTL). */
export const IconChevronEnd = createIcon('chevron-end', <path d="m9 5 7 7-7 7" />, {
  flipInRtl: true,
});
export const IconMenu = createIcon('menu', <path d="M4 7h16M4 12h16M4 17h16" />);

/** Every icon, for the specimen grid and the icon test. */
export const allIcons = {
  IconArrowUp,
  IconArrowDown,
  IconNew,
  IconSortAsc,
  IconSortDesc,
  IconSortNone,
  IconSearch,
  IconClose,
  IconCheck,
  IconAlert,
  IconInfo,
  IconStar,
  IconStarFilled,
  IconUser,
  IconLogout,
  IconGlobe,
  IconExternalLink,
  IconPlay,
  IconChevronStart,
  IconChevronEnd,
  IconMenu,
} as const;
