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
 * Settles x402 payment with Onchain.fi BEFORE minting
 *
 * Flow: verify → settle → mint → update-mint-status
 * This endpoint handles step 2 (settle) - transfers funds before NFT mint
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
    const { paymentId, paymentHeader, mintStatus = 'settled' } = body;

    // Validate required fields (tokenId/txHash not required - settle happens before mint)
    if (!paymentId || !paymentHeader) {
      return NextResponse.json(
        { error: 'Missing required fields: paymentId, paymentHeader' },
        { status: 400 }
      );
    }

    console.log('[x402/settle] Settling payment (pre-mint):', {
      paymentId,
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

    // Update payment status to settled (mint happens next)
    const { error: dbError } = await supabase
      .from('payment_transactions')
      .update({
        payment_status: 'settled',
        settled_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('payment_id', paymentId);

    if (dbError) {
      console.error('[x402/settle] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update payment transaction' },
        { status: 500 }
      );
    }

    console.log('[x402/settle] Payment settled - ready for mint');

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
