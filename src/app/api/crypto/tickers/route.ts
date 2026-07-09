import { NextResponse } from 'next/server';
import { ccxtClient } from '@/lib/data/ccxt-client';

// Cache route for 30s (Route Handlers are dynamic by default in Next 16)
export const revalidate = 30;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.max(1, Math.min(50, parseInt(limitParam, 10))) : 20;

  try {
    const data = await ccxtClient.getTopCryptoTickers(limit);
    return NextResponse.json({ data, timestamp: Date.now() });
  } catch (error) {
    console.error('[api/crypto/tickers]', error);
    return NextResponse.json(
      { error: 'Failed to fetch crypto tickers' },
      { status: 502 }
    );
  }
}
