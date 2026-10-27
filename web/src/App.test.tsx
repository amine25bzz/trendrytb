import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('App placeholder', () => {
  it('renders an accessible level-1 heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'TrendRadar' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
  });
});
