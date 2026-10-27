import { useId, type ReactNode } from 'react';
import styles from './Icon.module.css';

export interface IconProps {
  /** Accessible name. Without it the icon is decorative and hidden from assistive technology. */
  readonly title?: string | undefined;
  readonly className?: string | undefined;
}

interface IconOptions {
  /** Mirror horizontally in right-to-left text (for direction-bearing glyphs such as chevrons). */
  readonly flipInRtl?: boolean;
}

/**
 * Builds an inline SVG icon on a 24px grid. Strokes and fills use currentColor, so an icon
 * takes the text color of its context. Size follows the font size (--icon-size).
 */
export function createIcon(
  name: string,
  children: ReactNode,
  { flipInRtl = false }: IconOptions = {},
) {
  function Icon({ title, className }: IconProps) {
    const titleId = useId();
    const classes = [styles.icon, flipInRtl ? styles.flipInRtl : undefined, className]
      .filter(Boolean)
      .join(' ');
    const a11y = title
      ? ({ role: 'img', 'aria-labelledby': titleId } as const)
      : ({ 'aria-hidden': true, focusable: false } as const);
    return (
      <svg
        className={classes}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="square"
        strokeLinejoin="miter"
        data-icon={name}
        {...a11y}
      >
        {title ? <title id={titleId}>{title}</title> : null}
        {children}
      </svg>
    );
  }
  Icon.displayName = `Icon(${name})`;
  return Icon;
}
