import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { PaymentVerifyRequest, PaymentVerifyResponse } from '@/types/x402';
import { PAYMENT_CONFIG } from '@/lib/config';

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/x402/verify
 * Stores payment transaction in Supabase
 * SDK handles Onchain.fi verify - this just stores the data
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: PaymentVerifyRequest = await req.json();
    const {
      paymentId, // From SDK verify result
      paymentHeader,
      phraseCount,
      phrases,
      walletAddress,
      farcasterFid,
      farcasterUsername,
      sourcePlatform = 'web',
      paymentStatus = 'settled', // Default to 'settled', use 'failed' for failed payments
      errorMessage,
    } = body;

    // Validate required fields (paymentHeader optional for failed payments)
    if (!paymentId || !phraseCount || !phrases || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // paymentHeader required for successful payments only
    if (paymentStatus !== 'failed' && !paymentHeader) {
      return NextResponse.json(
        { error: 'Missing paymentHeader for successful payment' },
        { status: 400 }
      );
    }

    // Validate phrase count
    if (![1, 2, 3].includes(phraseCount)) {
      return NextResponse.json(
        { error: 'Invalid phrase count. Must be 1, 2, or 3' },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Validate phrases array
    if (!Array.isArray(phrases) || phrases.length === 0 || phrases.length > 3) {
      return NextResponse.json(
        { error: 'Invalid phrases array' },
        { status: 400 }
      );
    }

    // Get amount from config
    const expectedAmount = PAYMENT_CONFIG.PRICES[phraseCount as 1 | 2 | 3];

    console.log('[x402/verify] Storing payment:', {
      paymentId,
      phraseCount,
      expectedAmount,
      walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      sourcePlatform,
      paymentStatus,
    });

    // Store payment transaction in Supabase
    const { data: transaction, error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        payment_id: paymentId,
        wallet_address: walletAddress.toLowerCase(),
        phrase_count: phraseCount,
        amount_usdc: expectedAmount,
        phrases: phrases,
        payment_status: paymentStatus,
        mint_status: 'failed',  // Not minted yet, can retry
        payment_header: paymentHeader || '',
        // Dynamic timestamp based on status
        ...(paymentStatus === 'settled'
          ? { settled_at: new Date().toISOString() }
          : { failed_at: new Date().toISOString() }),
        error_message: errorMessage || null,
        // Farcaster data
        farcaster_fid: farcasterFid || null,
        farcaster_username: farcasterUsername || null,
        source_platform: sourcePlatform,
        source_network: 'base',
        destination_network: 'base',
      })
      .select()
      .single();

    if (dbError) {
      console.error('[x402/verify] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to store payment transaction' },
        { status: 500 }
      );
    }

    console.log('[x402/verify] Payment stored:', paymentId);

    const response: PaymentVerifyResponse = {
      success: true,
      paymentId,
      transactionId: transaction.id,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[x402/verify] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
