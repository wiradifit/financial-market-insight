import type { SignalAlert } from '@/lib/stores/notifications';

function formatPrice(p: number): string {
  if (p < 0.01) return p.toPrecision(4);
  if (p < 1000) return p.toFixed(2);
  return p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function buildMessage(alert: SignalAlert): string {
  const dir = alert.direction === 'BULLISH' ? '🟢 LONG' : alert.direction === 'BEARISH' ? '🔴 SHORT' : '🟡 NEUTRAL';
  const type = alert.signalType.replace(/_/g, ' ');

  let msg = `*${dir} | ${alert.symbol}* (${alert.confidence}%)\n`;
  msg += `Signal: ${type}\n`;
  msg += `${alert.message}\n`;

  if (alert.entryPrice) {
    msg += `\n📊 Entry: $${formatPrice(alert.entryPrice)}`;
    msg += ` | 🎯 TP: $${formatPrice(alert.tp ?? 0)}`;
    msg += ` | 🛑 SL: $${formatPrice(alert.sl ?? 0)}`;
  }

  return msg;
}

export async function sendTelegramNotification(
  alert: SignalAlert,
  botToken: string,
  chatId: string
): Promise<boolean> {
  try {
    const text = buildMessage(alert);
    const res = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function batchSendTelegram(
  alerts: SignalAlert[],
  botToken: string,
  chatId: string
): Promise<{ sent: number; failed: number }> {
  let sent = 0;
  let failed = 0;

  for (const alert of alerts) {
    const ok = await sendTelegramNotification(alert, botToken, chatId);
    if (ok) sent++; else failed++;
  }

  return { sent, failed };
}