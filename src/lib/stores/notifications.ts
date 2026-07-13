import { create } from 'zustand';

export interface SignalAlert {
  id: string;
  symbol: string;
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  signalType: string;
  confidence: number;
  message: string;
  entryPrice?: number;
  tp?: number;
  sl?: number;
  timestamp: number;
  sent?: boolean;
}

interface NotificationState {
  alerts: SignalAlert[];
  lastScanTimestamp: number;
  addAlerts: (alerts: SignalAlert[]) => void;
  markSent: (id: string) => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  alerts: [],
  lastScanTimestamp: 0,
  addAlerts: (newAlerts) =>
    set((state) => {
      const existing = new Set(state.alerts.map((a) => a.id));
      const fresh = newAlerts.filter((a) => !existing.has(a.id));
      if (fresh.length === 0) return state;
      return {
        alerts: [...fresh, ...state.alerts].slice(0, 20),
        lastScanTimestamp: Date.now(),
      };
    }),
  markSent: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, sent: true } : a)),
    })),
  clear: () => set({ alerts: [], lastScanTimestamp: 0 }),
}));