import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/x402/pending-mints?wallet=0x...
 *
 * Returns payments where payment is settled but mint failed.
 * These are paid mints that need to be retried.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');

    if (!wallet) {
      return NextResponse.json(
        { error: 'Missing required parameter: wallet' },
        { status: 400 }
      );
    }

    // Normalize wallet address to lowercase
    const walletAddress = wallet.toLowerCase();

    console.log('[x402/pending-mints] Fetching for wallet:', walletAddress.slice(0, 10) + '...');

    // Query for settled payments with failed mints
    const { data, error } = await supabase
      .from('payment_transactions')
      .select('*')
      .eq('wallet_address', walletAddress)
      .eq('payment_status', 'settled')
      .eq('mint_status', 'failed')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[x402/pending-mints] Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending mints' },
        { status: 500 }
      );
    }

    // Transform to frontend-friendly format
    const pendingMints = (data || []).map((tx) => ({
      paymentId: tx.payment_id,
      transactionId: tx.id,
      phrases: tx.phrases || [],
      phraseCount: tx.phrase_count,
      amountUsdc: tx.amount_usdc,
      failedAt: tx.failed_at,
      errorMessage: tx.error_message,
      errorCode: tx.error_code,
      createdAt: tx.created_at,
    }));

    console.log('[x402/pending-mints] Found:', pendingMints.length, 'pending mints');

    return NextResponse.json({ pendingMints });
  } catch (error) {
    console.error('[x402/pending-mints] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
