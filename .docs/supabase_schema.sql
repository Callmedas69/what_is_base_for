-- X402 Payment Transactions Schema
-- Full-featured with Farcaster miniapp support
-- Run this in Supabase SQL Editor

-- Payment transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Payment info
  payment_id TEXT UNIQUE NOT NULL,
  wallet_address TEXT NOT NULL,
  phrase_count INTEGER NOT NULL CHECK (phrase_count IN (1, 2, 3)),
  amount_usdc DECIMAL(10, 6) NOT NULL,
  phrases JSONB NOT NULL,
  payment_header TEXT,
  source_network TEXT DEFAULT 'base',
  destination_network TEXT DEFAULT 'base',

  -- Status tracking
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'settled', 'failed')),
  mint_status TEXT NOT NULL DEFAULT 'not_started' CHECK (mint_status IN ('not_started', 'minting', 'minted', 'failed')),

  -- NFT info
  token_id BIGINT,
  tx_hash TEXT,

  -- Farcaster miniapp support
  farcaster_fid BIGINT,
  farcaster_username TEXT,
  source_platform TEXT DEFAULT 'web' CHECK (source_platform IN ('web', 'farcaster_miniapp', 'mobile')),

  -- Timestamps
  verified_at TIMESTAMP,
  settled_at TIMESTAMP,
  minting_started_at TIMESTAMP,
  minted_at TIMESTAMP,
  failed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Error tracking
  error_message TEXT,
  error_code TEXT
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_id ON payment_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_wallet_address ON payment_transactions(wallet_address);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_transactions(payment_status);
CREATE INDEX IF NOT EXISTS idx_mint_status ON payment_transactions(mint_status);
CREATE INDEX IF NOT EXISTS idx_farcaster_fid ON payment_transactions(farcaster_fid);
CREATE INDEX IF NOT EXISTS idx_farcaster_username ON payment_transactions(farcaster_username);
CREATE INDEX IF NOT EXISTS idx_source_platform ON payment_transactions(source_platform);
CREATE INDEX IF NOT EXISTS idx_created_at ON payment_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_token_id ON payment_transactions(token_id);

-- Composite index for Farcaster user lookups
CREATE INDEX IF NOT EXISTS idx_farcaster_user ON payment_transactions(farcaster_fid, farcaster_username) WHERE farcaster_fid IS NOT NULL;

-- Auto-update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS update_payment_transactions_updated_at ON payment_transactions;
CREATE TRIGGER update_payment_transactions_updated_at
  BEFORE UPDATE ON payment_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Optional: View for Farcaster users stats
CREATE OR REPLACE VIEW farcaster_users_stats AS
SELECT
  farcaster_fid,
  farcaster_username,
  COUNT(*) as total_mints,
  COUNT(*) FILTER (WHERE mint_status = 'minted') as successful_mints,
  COUNT(*) FILTER (WHERE payment_status = 'settled') as paid_mints,
  SUM(amount_usdc) as total_spent_usdc,
  MIN(created_at) as first_mint_at,
  MAX(created_at) as last_mint_at
FROM payment_transactions
WHERE farcaster_fid IS NOT NULL
GROUP BY farcaster_fid, farcaster_username;

-- Enable Row Level Security (RLS)
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous reads for payment history (users can only see their own)
CREATE POLICY "Users can view their own payment transactions"
  ON payment_transactions
  FOR SELECT
  USING (true); -- Allow all reads (we filter by wallet in the API)

-- Policy: Allow service role to insert
CREATE POLICY "Service role can insert payment transactions"
  ON payment_transactions
  FOR INSERT
  WITH CHECK (true); -- Service role only

-- Policy: Allow service role to update
CREATE POLICY "Service role can update payment transactions"
  ON payment_transactions
  FOR UPDATE
  USING (true); -- Service role only

-- Grant permissions to anon and authenticated roles
GRANT SELECT ON payment_transactions TO anon;
GRANT SELECT ON payment_transactions TO authenticated;
GRANT SELECT ON farcaster_users_stats TO anon;
GRANT SELECT ON farcaster_users_stats TO authenticated;

-- Note: INSERT and UPDATE are handled by service role key in API routes
