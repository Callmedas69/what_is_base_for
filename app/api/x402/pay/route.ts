import { NextRequest, NextResponse } from 'next/server';

// Timeout helper
const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * POST /api/x402/pay
 * Proxies payment request to Onchain.fi API
 * Keeps API key server-side only
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentHeader, to, sourceNetwork, destinationNetwork, expectedAmount, expectedToken, priority } = body;

    // Validate required fields
    if (!paymentHeader || !to || !expectedAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Call Onchain.fi API with server-side API key
    const response = await fetchWithTimeout(
      'https://api.onchain.fi/v1/pay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ONCHAIN_API_KEY || '',
        },
        body: JSON.stringify({
          paymentHeader,
          to,
          sourceNetwork: sourceNetwork || 'base',
          destinationNetwork: destinationNetwork || 'base',
          expectedAmount,
          expectedToken: expectedToken || 'USDC',
          priority: priority || 'balanced',
        }),
      },
      30000 // 30 second timeout
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('[x402/pay] Onchain.fi API error:', data);
      return NextResponse.json(
        { error: data.error || data.message || 'Payment failed', status: 'error' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('[x402/pay] Request timeout');
      return NextResponse.json(
        { error: 'Payment request timed out' },
        { status: 504 }
      );
    }

    console.error('[x402/pay] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
