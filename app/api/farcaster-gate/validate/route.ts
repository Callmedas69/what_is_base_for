import { NextRequest, NextResponse } from 'next/server';
import { FARCASTER_GATE_CONFIG } from '@/lib/config';

/**
 * Validate if a user follows the target Farcaster account
 * Uses Neynar API to check viewer_context.following
 */
export async function POST(request: NextRequest) {
  try {
    const { fid } = await request.json();

    if (!fid || typeof fid !== 'number') {
      return NextResponse.json(
        { error: 'Invalid FID', isFollowing: false, isEligible: false },
        { status: 400 }
      );
    }

    const targetFid = FARCASTER_GATE_CONFIG.TARGET_FID;
    if (!targetFid) {
      return NextResponse.json(
        { error: 'Target FID not configured', isFollowing: false, isEligible: false },
        { status: 500 }
      );
    }

    const apiKey = process.env.NEYNAR_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Neynar API key not configured', isFollowing: false, isEligible: false },
        { status: 500 }
      );
    }

    // Use Neynar bulk endpoint with viewer_fid to get follow status
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${targetFid}&viewer_fid=${fid}`,
      {
        headers: {
          'accept': 'application/json',
          'x-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Farcaster Gate] Neynar API error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to verify follow status', isFollowing: false, isEligible: false },
        { status: 500 }
      );
    }

    const data = await response.json();
    const targetUser = data.users?.[0];

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Target user not found', isFollowing: false, isEligible: false },
        { status: 404 }
      );
    }

    // Check viewer_context.following - this is true if the viewer (fid) follows the target
    const isFollowing = targetUser.viewer_context?.following === true;

    return NextResponse.json({
      isFollowing,
      isEligible: isFollowing,
      targetUsername: targetUser.username,
      targetFid: targetUser.fid,
    });
  } catch (error) {
    console.error('[Farcaster Gate] Validation error:', error);
    return NextResponse.json(
      { error: 'Internal server error', isFollowing: false, isEligible: false },
      { status: 500 }
    );
  }
}
