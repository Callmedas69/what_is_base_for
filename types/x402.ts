/**
 * X402 Payment Integration Type Definitions
 * Full-featured with Farcaster miniapp support
 */

// Payment Status Types
export type PaymentStatus = 'pending' | 'verified' | 'settled' | 'failed';
export type MintStatus = 'not_started' | 'minting' | 'minted' | 'failed';
export type SourcePlatform = 'web' | 'farcaster_miniapp' | 'mobile';
export type PhraseCount = 1 | 2 | 3;

// Payment Transaction (matches Supabase schema)
export interface PaymentTransaction {
  id: string;

  // Payment info
  payment_id: string;
  wallet_address: string;
  phrase_count: PhraseCount;
  amount_usdc: string;
  phrases: string[];
  payment_header?: string;
  source_network: string;
  destination_network: string;

  // Status tracking
  payment_status: PaymentStatus;
  mint_status: MintStatus;

  // NFT info
  token_id?: string;
  tx_hash?: string;

  // Farcaster miniapp support
  farcaster_fid?: number;
  farcaster_username?: string;
  source_platform: SourcePlatform;

  // Timestamps
  verified_at?: string;
  settled_at?: string;
  minting_started_at?: string;
  minted_at?: string;
  failed_at?: string;
  created_at: string;
  updated_at: string;

  // Error tracking
  error_message?: string;
  error_code?: string;
}

// Payment Configuration
export interface PaymentConfig {
  readonly ENABLED: boolean;
  readonly PRICES: Record<PhraseCount, string>;
  readonly PRICING_DISPLAY: Record<
    PhraseCount,
    {
      price: string;
      label: string;
      badge?: string;
    }
  >;
  readonly TOKEN: 'USDC';
  readonly NETWORK: 'base';
  readonly RECIPIENT: string;
}

// API Request/Response Types
export interface PaymentVerifyRequest {
  paymentId: string; // From SDK verify result
  paymentHeader: string;
  phraseCount: PhraseCount;
  phrases: string[];
  walletAddress: string;
  farcasterFid?: number;
  farcasterUsername?: string;
  sourcePlatform?: SourcePlatform;
  paymentStatus?: PaymentStatus; // Optional: defaults to 'settled', use 'failed' for failed payments
  errorMessage?: string; // Error message for failed payments
}

export interface PaymentVerifyResponse {
  success: boolean;
  paymentId: string;
  transactionId: string;
}

export interface PaymentSettleRequest {
  paymentId: string;
  paymentHeader: string;
  /** @deprecated Settlement now happens before mint - tokenId not available */
  tokenId?: string;
  /** @deprecated Settlement now happens before mint - txHash not available */
  txHash?: string;
  mintStatus?: MintStatus;
}

export interface PaymentSettleResponse {
  success: boolean;
}

export interface UpdateMintStatusRequest {
  paymentId: string;
  mintStatus: MintStatus;
  /** Token ID - required when mintStatus is 'minted' */
  tokenId?: string;
  /** Transaction hash - required when mintStatus is 'minted' */
  txHash?: string;
  /** Error message - used when mintStatus is 'failed' */
  errorMessage?: string;
  /** Error code - used when mintStatus is 'failed' */
  errorCode?: string;
}

export interface UpdateMintStatusResponse {
  success: boolean;
}

export interface PaymentHistoryResponse {
  payments: PaymentTransaction[];
}

// Farcaster Context
export interface FarcasterContext {
  isFarcaster: boolean;
  fid: number | null;
  username: string | null;
}

// Farcaster User Stats
export interface FarcasterUserStats {
  farcaster_fid: number;
  farcaster_username: string;
  total_mints: number;
  successful_mints: number;
  paid_mints: number;
  total_spent_usdc: string;
  first_mint_at: string;
  last_mint_at: string;
}

// Payment Hook Return Type
export interface UseX402PaymentResult {
  /**
   * Step 1: Verify payment authorization (user signs EIP-712)
   */
  verifyPayment: (
    phraseCount: PhraseCount,
    phrases: string[],
    walletAddress: string,
    farcasterContext?: FarcasterContext
  ) => Promise<{
    paymentId: string;
    transactionId: string;
    paymentHeader: string;
  }>;
  /**
   * Step 2: Settle payment BEFORE minting (funds transferred)
   */
  settlePayment: (
    paymentId: string,
    paymentHeader: string
  ) => Promise<void>;
  /**
   * Step 4: Record successful mint in database (after on-chain mint)
   */
  recordMintSuccess: (
    paymentId: string,
    tokenId: bigint,
    txHash: string
  ) => Promise<void>;
  /**
   * Update mint status during the process
   */
  updateMintStatus: (
    paymentId: string,
    mintStatus: MintStatus,
    errorMessage?: string,
    errorCode?: string
  ) => Promise<void>;
  isVerifying: boolean;
  isSettling: boolean;
  isUpdating: boolean;
}

// Onchain.fi API Types
export interface OnchainVerifyParams {
  paymentHeader: string;
  sourceNetwork: string;
  destinationNetwork: string;
  expectedAmount: string;
  expectedToken: string;
  recipientAddress: string;
}

export interface OnchainVerifyResponse {
  data: {
    paymentId: string;
    [key: string]: unknown;
  };
}

export interface OnchainSettleParams {
  paymentId: string;
  paymentHeader: string;
  sourceNetwork: string;
  destinationNetwork: string;
}

// Error Types
export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class VerificationError extends PaymentError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, code, details);
    this.name = 'VerificationError';
  }
}

export class SettlementError extends PaymentError {
  constructor(message: string, code?: string, details?: unknown) {
    super(message, code, details);
    this.name = 'SettlementError';
  }
}
