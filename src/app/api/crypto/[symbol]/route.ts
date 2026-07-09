import { NextResponse } from 'next/server';
import { ccxtClient } from '@/lib/data/ccxt-client';

export const revalidate = 10;

/** Convert a URL-style symbol (e.g. `BTC-USD`) into a CCXT market symbol (`BTC/USDT`). */
function toCcxtSymbol(symbol: string): string {
  return symbol.replace('-', '/').replace(/USD$/, 'USDT');
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const { symbol } = await params;
  const ccxtSymbol = toCcxtSymbol(symbol);

  try {
    const [ticker, history] = await Promise.all([
      ccxtClient.getTicker(ccxtSymbol),
      ccxtClient.getOHLCV(ccxtSymbol, '1h', undefined, 24),
    ]);

    if (!ticker) {
      return NextResponse.json(
        { error: 'Symbol not found on exchange' },
        { status: 404 }
      );
    }

    return NextResponse.json({ ticker, history, timestamp: Date.now() });
  } catch (error) {
    console.error(`[api/crypto/${symbol}]`, error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto data' },
      { status: 502 }
    );
  }
}
