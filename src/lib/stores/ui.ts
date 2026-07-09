import { create } from 'zustand';

interface UIState {
  mobileNavOpen: boolean;
  toggleMobileNav: () => void;
  setMobileNav: (open: boolean) => void;
}

export const useUIStore = create<UIState>(set => ({
  mobileNavOpen: false,
  toggleMobileNav: () => set(state => ({ mobileNavOpen: !state.mobileNavOpen })),
  setMobileNav: open => set({ mobileNavOpen: open }),
}));
