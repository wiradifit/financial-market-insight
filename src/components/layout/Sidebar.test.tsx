import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockSetMobileNav = vi.fn();
const navPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({ push: navPush }),
  default: ({ href, children, onClick }: Record<string, unknown>) => (
    <a href={href as string} onClick={onClick as () => void}>{children as React.ReactNode}</a>
  ),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, onClick, ...props }: Record<string, unknown>) => (
    <a href={href as string} onClick={onClick as () => void} {...props}>{children as React.ReactNode}</a>
  ),
}));

vi.mock('@/lib/stores/ui', () => ({
  useUIStore: (sel: (s: unknown) => unknown) => {
    const state = { mobileNavOpen: false, toggleMobileNav: vi.fn(), setMobileNav: mockSetMobileNav };
    return sel(state);
  },
}));

describe('Sidebar', () => {
  beforeEach(() => {
    mockSetMobileNav.mockClear();
  });

  it('renders Market Insight title', async () => {
    const { Sidebar } = await import('@/components/layout/Sidebar');
    render(<Sidebar />);
    expect(screen.getByText('Market Insight')).toBeDefined();
  });

  it('renders Dashboard nav link', async () => {
    const { Sidebar } = await import('@/components/layout/Sidebar');
    render(<Sidebar />);
    expect(screen.getByText('Dashboard')).toBeDefined();
  });

  it('renders all nav items', async () => {
    const { Sidebar } = await import('@/components/layout/Sidebar');
    render(<Sidebar />);
    expect(screen.getByText('Crypto Signals')).toBeDefined();
    expect(screen.getByText('Stock Analysis')).toBeDefined();
    expect(screen.getByText('Forex Market')).toBeDefined();
    expect(screen.getByText('Notifications')).toBeDefined();
    expect(screen.getByText('Network Monitor')).toBeDefined();
  });

  it('renders Signal Engine status', async () => {
    const { Sidebar } = await import('@/components/layout/Sidebar');
    render(<Sidebar />);
    expect(screen.getByText('Signal Engine')).toBeDefined();
    expect(screen.getByText('Online')).toBeDefined();
  });

  it('sets mobileNav to false on mount', async () => {
    const { Sidebar } = await import('@/components/layout/Sidebar');
    render(<Sidebar />);
    expect(mockSetMobileNav).toHaveBeenCalledWith(false);
  });
});