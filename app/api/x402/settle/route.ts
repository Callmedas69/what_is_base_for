import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { PaymentSettleRequest, PaymentSettleResponse } from '@/types/x402';

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Onchain.fi API configuration
const ONCHAIN_API_KEY = process.env.ONCHAIN_API_KEY;
const ONCHAIN_API_URL = 'https://api.onchain.fi/v1';

/**
 * POST /api/x402/settle
 * Settles x402 payment with Onchain.fi and updates transaction in Supabase
 */
export async function POST(req: NextRequest) {
  try {
    // Validate API key exists
    if (!ONCHAIN_API_KEY) {
      console.error('[x402/settle] ONCHAIN_API_KEY not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: PaymentSettleRequest = await req.json();
    const { paymentId, paymentHeader, tokenId, txHash, mintStatus = 'minted' } = body;

    // Validate required fields
    if (!paymentId || !paymentHeader || !tokenId || !txHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('[x402/settle] Settling payment:', {
      paymentId,
      tokenId,
      txHash: `${txHash.slice(0, 10)}...${txHash.slice(-8)}`,
      mintStatus,
    });

    // Settle payment with Onchain.fi
    const settleResponse = await fetch(`${ONCHAIN_API_URL}/settle`, {
      method: 'POST',
      headers: {
        'X-API-Key': ONCHAIN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        paymentHeader,
        sourceNetwork: 'base',
        destinationNetwork: 'base',
      }),
    });

    if (!settleResponse.ok) {
      const settleData = await settleResponse.json();
      console.error('[x402/settle] Onchain.fi settlement failed:', settleData);
      return NextResponse.json(
        { error: settleData.error || 'Payment settlement failed' },
        { status: 400 }
      );
    }

    console.log('[x402/settle] Payment settled with Onchain.fi');

    // Update payment and mint status in Supabase
    const { error: dbError } = await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'settled',
        mint_status: mintStatus,
        token_id: tokenId,
        tx_hash: txHash,
        settled_at: new Date().toISOString(),
        minted_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId);

    if (dbError) {
      console.error('[x402/settle] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update payment transaction' },
        { status: 500 }
      );
    }

    console.log('[x402/settle] Transaction updated in database');

    const response: PaymentSettleResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[x402/settle] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
