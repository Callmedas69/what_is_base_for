import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { UpdateMintStatusRequest, UpdateMintStatusResponse } from '@/types/x402';

// Initialize Supabase client with service role key (server-side only)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/x402/update-mint-status
 * Updates mint status for a payment transaction
 * Used to track: not_started → minting → minted/failed
 */
export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: UpdateMintStatusRequest = await req.json();
    const { paymentId, mintStatus, errorMessage, errorCode } = body;

    // Validate required fields
    if (!paymentId || !mintStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate mint status
    const validStatuses = ['not_started', 'minting', 'minted', 'failed'];
    if (!validStatuses.includes(mintStatus)) {
      return NextResponse.json(
        { error: `Invalid mint status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    console.log('[x402/update-mint-status] Updating status:', {
      paymentId,
      mintStatus,
      hasError: !!errorMessage,
    });

    // Prepare update data
    const updateData: any = {
      mint_status: mintStatus,
      updated_at: new Date().toISOString(),
    };

    // Add timestamp based on status
    if (mintStatus === 'minting') {
      updateData.minting_started_at = new Date().toISOString();
    } else if (mintStatus === 'minted') {
      updateData.minted_at = new Date().toISOString();
    } else if (mintStatus === 'failed') {
      updateData.failed_at = new Date().toISOString();
      updateData.error_message = errorMessage || null;
      updateData.error_code = errorCode || null;
    }

    // Update in Supabase
    const { error: dbError } = await supabase
      .from('payment_transactions')
      .update(updateData)
      .eq('payment_id', paymentId);

    if (dbError) {
      console.error('[x402/update-mint-status] Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to update mint status' },
        { status: 500 }
      );
    }

    console.log('[x402/update-mint-status] Status updated successfully');

    const response: UpdateMintStatusResponse = {
      success: true,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[x402/update-mint-status] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
