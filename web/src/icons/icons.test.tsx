import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { allIcons } from './index';

const entries = Object.entries(allIcons);

describe('icon set', () => {
  it('contains the 21 icons listed in the P01 plan', () => {
    expect(entries).toHaveLength(21);
  });

  it.each(entries)('%s is a decorative, hidden <svg> by default', (_name, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).not.toHaveAttribute('role');
    expect(svg?.querySelector('title')).toBeNull();
  });

  it.each(entries)('%s with a title is an image with that accessible name', (name, Icon) => {
    render(<Icon title={`label for ${name}`} />);
    const img = screen.getByRole('img', { name: `label for ${name}` });
    expect(img.tagName.toLowerCase()).toBe('svg');
    expect(img).not.toHaveAttribute('aria-hidden');
  });

  it('uses currentColor so icons take the surrounding text color', () => {
    const { container } = render(<allIcons.IconSearch />);
    expect(container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
  });
});
