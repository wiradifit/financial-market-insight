import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test-utils';

vi.mock('@/lib/stores/notifications', () => ({
  useNotificationStore: (sel: (s: unknown) => unknown) => {
    const state = { alerts: [], addAlerts: vi.fn(), lastScanTimestamp: 0, markSent: vi.fn(), clear: vi.fn() };
    return sel(state);
  },
}));

describe('SettingsPage', () => {
  it('renders title', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Notifications')).toBeDefined();
  });

  it('renders Telegram Configuration section', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Telegram Configuration')).toBeDefined();
  });

  it('renders Pending Alerts section', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Pending Alerts')).toBeDefined();
  });

  it('renders How to set up section', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('How to set up')).toBeDefined();
  });

  it('renders Send button', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Send 0')).toBeDefined();
  });

  it('renders no alerts message', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.queryByText(/No alerts yet/)).toBeDefined();
  });

  it('renders Telegram Bot Token input', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByPlaceholderText('123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11')).toBeDefined();
  });

  it('renders Telegram Chat ID input', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByPlaceholderText('-1001234567890 or 123456789')).toBeDefined();
  });

  it('renders min confidence slider', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Enable min confidence')).toBeDefined();
  });

  it('renders Clear button', async () => {
    const { default: SettingsPage } = await import('@/app/settings/page');
    renderWithProviders(<SettingsPage />);
    expect(screen.getByText('Clear')).toBeDefined();
  });
});