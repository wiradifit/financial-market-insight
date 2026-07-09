import { NextResponse } from 'next/server';
import { ccxtClient } from '@/lib/data/ccxt-client';

export const revalidate = 10;

const COMPARE_EXCHANGES = ['binance', 'kraken', 'coinbase'] as const;

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
    const prices = await ccxtClient.getMultiExchangePrices(
      ccxtSymbol,
      [...COMPARE_EXCHANGES]
    );

    if (prices.length === 0) {
      return NextResponse.json(
        { error: 'Prices not found on any exchange' },
        { status: 404 }
      );
    }

    // Calculate spread & arbitrage
    const validPrices = prices.map(p => p.price).filter(p => p > 0);
    let spread = { min: 0, max: 0, diff: 0, diffPercent: 0 };

    if (validPrices.length > 0) {
      const min = Math.min(...validPrices);
      const max = Math.max(...validPrices);
      const diff = max - min;
      const diffPercent = min > 0 ? (diff / min) * 100 : 0;
      spread = { min, max, diff, diffPercent };
    }

    return NextResponse.json({ prices, spread, timestamp: Date.now() });
  } catch (error) {
    console.error(`[api/crypto/${symbol}/exchanges]`, error);
    return NextResponse.json(
      { error: 'Failed to fetch multi-exchange crypto data' },
      { status: 502 }
    );
  }
}
