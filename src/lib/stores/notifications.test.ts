import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore, type SignalAlert } from '@/lib/stores/notifications';

const makeAlert = (id: string, opts: Partial<SignalAlert> = {}): SignalAlert => ({
  id,
  symbol: 'BTC-USD',
  direction: 'BULLISH',
  signalType: 'RSI_OVERSOLD',
  confidence: 85,
  message: 'RSI signal',
  timestamp: Date.now(),
  ...opts,
});

describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.getState().clear();
  });

  it('initializes with empty alerts', () => {
    const state = useNotificationStore.getState();
    expect(state.alerts).toEqual([]);
    expect(state.lastScanTimestamp).toBe(0);
  });

  it('addAlerts appends new alerts', () => {
    const alerts = [makeAlert('alert-1'), makeAlert('alert-2')];
    useNotificationStore.getState().addAlerts(alerts);

    const state = useNotificationStore.getState();
    expect(state.alerts).toHaveLength(2);
  });

  it('addAlerts deduplicates by id', () => {
    useNotificationStore.getState().addAlerts([makeAlert('alert-1')]);
    useNotificationStore.getState().addAlerts([makeAlert('alert-1')]);

    expect(useNotificationStore.getState().alerts).toHaveLength(1);
  });

  it('addAlerts caps at 20 alerts', () => {
    const all = Array.from({ length: 25 }, (_, i) => makeAlert(`a-${i}`));
    useNotificationStore.getState().addAlerts(all);

    expect(useNotificationStore.getState().alerts).toHaveLength(20);
  });

  it('addAlerts updates lastScanTimestamp', () => {
    useNotificationStore.getState().addAlerts([makeAlert('alert-1')]);
    expect(useNotificationStore.getState().lastScanTimestamp).toBeGreaterThan(0);
  });

  it('addAlerts skips all duplicates', () => {
    useNotificationStore.getState().addAlerts([makeAlert('dup')]);
    const prevTs = useNotificationStore.getState().lastScanTimestamp;

    useNotificationStore.getState().addAlerts([makeAlert('dup')]);
    expect(useNotificationStore.getState().alerts).toHaveLength(1);
    expect(useNotificationStore.getState().lastScanTimestamp).toBe(prevTs);
  });

  it('markSent sets sent to true for given id', () => {
    useNotificationStore.getState().addAlerts([
      makeAlert('a1', { sent: false }),
      makeAlert('a2', { sent: false }),
    ]);

    useNotificationStore.getState().markSent('a1');

    const alerts = useNotificationStore.getState().alerts;
    expect(alerts.find((a) => a.id === 'a1')?.sent).toBe(true);
    expect(alerts.find((a) => a.id === 'a2')?.sent).toBe(false);
  });

  it('markSent does nothing for unknown id', () => {
    useNotificationStore.getState().addAlerts([makeAlert('a1')]);
    useNotificationStore.getState().markSent('unknown');

    expect(useNotificationStore.getState().alerts).toHaveLength(1);
    expect(useNotificationStore.getState().alerts[0].sent).toBeUndefined();
  });

  it('clear resets state', () => {
    useNotificationStore.getState().addAlerts([makeAlert('a1')]);
    useNotificationStore.getState().markSent('a1');

    useNotificationStore.getState().clear();

    expect(useNotificationStore.getState().alerts).toEqual([]);
    expect(useNotificationStore.getState().lastScanTimestamp).toBe(0);
  });
});