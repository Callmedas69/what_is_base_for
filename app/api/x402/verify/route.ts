import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { PaymentVerifyRequest, PaymentVerifyResponse } from '@/types/x402';

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Onchain.fi API configuration
const ONCHAIN_API_KEY = process.env.ONCHAIN_API_KEY;
const ONCHAIN_API_URL = 'https://api.onchain.fi/v1';
const USDC_RECIPIENT = process.env.USDC_RECIPIENT_ADDRESS;

/**
 * POST /api/x402/verify
 * Verifies x402 payment with Onchain.fi and stores transaction in Supabase
 */
export async function POST(req: NextRequest) {
  try {
    // Validate API key exists
    if (!ONCHAIN_API_KEY) {
      console.error('[x402/verify] ONCHAIN_API_KEY not configured');
      return NextResponse.json(
        { error: 'Payment service not configured' },
        { status: 500 }
      );
    }

    if (!USDC_RECIPIENT) {
      console.error('[x402/verify] USDC_RECIPIENT_ADDRESS not configured');
      return NextResponse.json(
        { error: 'Payment recipient not configured' },
        { status: 500 }
      );
    }

    // Parse request body
    const body: PaymentVerifyRequest = await req.json();
    const {
      paymentHeader,
      phraseCount,
      phrases,
      walletAddress,
      farcasterFid,
      farcasterUsername,
      sourcePlatform = 'web',
    } = body;

    // Validate required fields
    if (!paymentHeader || !phraseCount || !phrases || !walletAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    // Calculate expected amount based on phrase count
    const amounts: Record<1 | 2 | 3, string> = {
      1: '0.20',
      2: '0.40',
      3: '0.30',
    };
    const expectedAmount = amounts[phraseCount as 1 | 2 | 3];

    console.log('[x402/verify] Verifying payment:', {
      phraseCount,
      expectedAmount,
      walletAddress: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      farcasterFid,
      sourcePlatform,
    });

    // Verify payment with Onchain.fi
    const verifyResponse = await fetch(`${ONCHAIN_API_URL}/verify`, {
      method: 'POST',
      headers: {
        'X-API-Key': ONCHAIN_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentHeader,
        sourceNetwork: 'base',
        destinationNetwork: 'base',
        expectedAmount,
        expectedToken: 'USDC',
        recipientAddress: USDC_RECIPIENT,
      }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyResponse.ok) {
      console.error('[x402/verify] Onchain.fi verification failed:', verifyData);
      return NextResponse.json(
        { error: verifyData.error || 'Payment verification failed' },
        { status: 400 }
      );
    }

    const paymentId = verifyData.data?.paymentId;
    if (!paymentId) {
      console.error('[x402/verify] No paymentId in response:', verifyData);
      return NextResponse.json(
        { error: 'Invalid verification response' },
        { status: 500 }
      );
    }

    console.log('[x402/verify] Payment verified:', paymentId);

    // Store payment transaction in Supabase
    const { data: transaction, error: dbError } = await supabase
      .from('payment_transactions')
      .insert({
        payment_id: paymentId,
        wallet_address: walletAddress.toLowerCase(),
        phrase_count: phraseCount,
        amount_usdc: expectedAmount,
        phrases: phrases,
        payment_status: 'verified',
        mint_status: 'not_started',
        payment_header: paymentHeader,
        verified_at: new Date().toISOString(),
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

    console.log('[x402/verify] Transaction stored:', transaction.id);

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
