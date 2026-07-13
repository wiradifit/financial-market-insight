import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ComingSoonPage } from '@/components/layout/ComingSoonPage';

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: Record<string, unknown>) => (
    <a href={href as string} {...props}>{children as React.ReactNode}</a>
  ),
}));

describe('ComingSoonPage', () => {
  it('renders title and description', () => {
    render(<ComingSoonPage title="My Page" description="Coming soon description" />);
    expect(screen.getByText('My Page')).toBeDefined();
    expect(screen.getByText('Coming soon description')).toBeDefined();
  });

  it('renders Coming soon badge', () => {
    render(<ComingSoonPage title="T" description="D" />);
    expect(screen.getByText('Coming soon')).toBeDefined();
  });

  it('renders dashboard link', () => {
    render(<ComingSoonPage title="T" description="D" />);
    const link = screen.getByText('dashboard');
    expect(link).toBeDefined();
    expect(link.closest('a')?.getAttribute('href')).toBe('/');
  });

  it('renders with different props', () => {
    render(<ComingSoonPage title="Forex Signals" description="Advanced forex analysis" />);
    expect(screen.getByText('Forex Signals')).toBeDefined();
    expect(screen.getByText('Advanced forex analysis')).toBeDefined();
  });
});