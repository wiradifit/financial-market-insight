import { describe, it, expect } from 'vitest';
import { useUIStore } from '@/lib/stores/ui';

describe('useUIStore', () => {
  it('starts with mobileNavOpen false', () => {
    const state = useUIStore.getState();
    expect(state.mobileNavOpen).toBe(false);
  });

  it('toggleMobileNav flips state', () => {
    useUIStore.getState().toggleMobileNav();
    expect(useUIStore.getState().mobileNavOpen).toBe(true);

    useUIStore.getState().toggleMobileNav();
    expect(useUIStore.getState().mobileNavOpen).toBe(false);
  });

  it('setMobileNav sets to true', () => {
    useUIStore.getState().setMobileNav(true);
    expect(useUIStore.getState().mobileNavOpen).toBe(true);
  });

  it('setMobileNav sets to false', () => {
    useUIStore.getState().setMobileNav(false);
    expect(useUIStore.getState().mobileNavOpen).toBe(false);
  });
});