/**
 * Centralized Configuration
 * Single source of truth for all app constants and settings
 */

import { CONTRACT_ADDRESSES, type NetworkConfig } from "@/abi/WhatIsBaseFor.abi";

/**
 * Current Network Configuration
 * Change this to switch networks
 */
export const CURRENT_NETWORK = "baseMainnet" as const;

/**
 * Network Configuration (from contract addresses)
 */
export const NETWORK_CONFIG: NetworkConfig = CONTRACT_ADDRESSES[CURRENT_NETWORK];

/**
 * Contract Addresses
 */
export const CONTRACTS = {
  WHATISBASEFOR: NETWORK_CONFIG.whatIsBaseFor,
  ASSETS: NETWORK_CONFIG.assets,
  RENDERER: NETWORK_CONFIG.renderer,
  PHRASES: NETWORK_CONFIG.phrases,
} as const;

/**
 * Chain Configuration
 */
export const CHAIN_CONFIG = {
  CHAIN_ID: NETWORK_CONFIG.chainId,
  EXPLORER: NETWORK_CONFIG.explorer,
  BASESCAN: NETWORK_CONFIG.basescan,
} as const;

/**
 * Minting Limits
 */
export const MINT_LIMITS = {
  MAX_SUPPLY: NETWORK_CONFIG.maxSupply,
  MAX_PER_WALLET: NETWORK_CONFIG.maxPerWallet,
  MAX_REGULAR_MINT: NETWORK_CONFIG.maxRegularMint,
  MAX_CUSTOM_MINT: NETWORK_CONFIG.maxCustomMint,
} as const;

/**
 * Phrase Input Configuration
 * Matches contract logic - empty phrases allowed, will be auto-filled
 * Note: Curly brackets {} are added automatically, users just type plain text
 */
export const PHRASE_CONFIG = {
  MIN_LENGTH: 0, // Empty allowed (auto-filled with random)
  MAX_LENGTH: 13,
  MIN_CUSTOM_COUNT: 1, // At least 1 non-empty required
  TOTAL_COUNT: 3,
  PLACEHOLDER: [
    "A word like 'freedom' (≤15 chars)",
    "Something small, like 'us' (≤15 chars)",
    "A tiny feeling, like 'vibes' (≤15 chars)",
  ],


} as const;

/**
 * WalletConnect Configuration
 */
export const WALLETCONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  process.env.WALLETCONNECT_PROJECT_ID ||
  "";

if (!WALLETCONNECT_PROJECT_ID) {
  console.warn(
    "⚠️ WalletConnect Project ID not found. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID or WALLETCONNECT_PROJECT_ID in .env.local"
  );
}

/**
 * App Configuration
 */
export const APP_CONFIG = {
  NAME: "WHAT IS BASE FOR?",
  DESCRIPTION: "A fully onchain collection of base spirits",
  AUDIO_PATH: "/assets/What is Base for.mp3",
  TOKEN_DISPLAY_ID: 0, // Which token ID to display in hero
  SHARE_TEXT: "What does Base mean to you, when your words live forever onchain?",
  SHARE_TEXTS_AFTER_MINT: [
    "To me, Base feels like: {phrase1}, {phrase2}, {phrase3}",
    "My Base is made of: {phrase1}, {phrase2}, {phrase3}",
    "Base, to my heart, is: {phrase1}, {phrase2}, {phrase3}",
    "If I describe Base in fragments: {phrase1}, {phrase2}, {phrase3}",
    "Base, in my own small words: {phrase1}, {phrase2}, {phrase3}",
    "What Base whispers to me: {phrase1}, {phrase2}, {phrase3}",
    "Base, in pieces of feeling: {phrase1}, {phrase2}, {phrase3}",
    "What Base means to me: {phrase1}, {phrase2}, {phrase3}",
  ],
} as const;

/**
 * RainbowKit Theme Configuration
 */
export const RAINBOWKIT_CONFIG = {
  appName: APP_CONFIG.NAME,
  projectId: WALLETCONNECT_PROJECT_ID,
  theme: "dark" as const,
} as const;

/**
 * UI Messages
 */
export const MESSAGES = {
  CONNECT_WALLET: "Please connect your wallet to mint",
  INVALID_PHRASES: "At least one phrase required (max 13 characters each). Empty phrases will use random text.",
  MINTING: "Minting...",
  MINT_SUCCESS: "Successfully minted!",
  MINT_ERROR: "Minting failed. Please try again.",
  TRANSACTION_PENDING: "Waiting for transaction confirmation...",
  PAYMENT_VERIFYING: "Verifying payment...",
  PAYMENT_SETTLING: "Settling payment...",
  PAYMENT_FAILED: "Payment failed. Please try again.",
  INSUFFICIENT_BALANCE: "Insufficient USDC balance.",
} as const;

/**
 * X402 Payment Configuration
 * Full-featured with Farcaster support
 */
export const PAYMENT_CONFIG = {
  ENABLED: true,
  PRICES: {
    1: '0.20',
    2: '0.40',
    3: '0.30', // Best value - 50% discount!
  } as const,
  PRICING_DISPLAY: {
    1: { price: '0.20', label: '1 phrase' },
    2: { price: '0.40', label: '2 phrases' },
    3: { price: '0.30', label: '3 phrases', badge: 'Best Value!' },
  } as const,
  TOKEN: 'USDC' as const,
  NETWORK: CURRENT_NETWORK,
  RECIPIENT: process.env.NEXT_PUBLIC_USDC_RECIPIENT_ADDRESS || '',
} as const;

/**
 * Farcaster Social Gate Configuration
 * Users must follow and recast to mint (free mint)
 */
export const FARCASTER_GATE_CONFIG = {
  // Enable/disable the gate
  ENABLED: true,
  // Your Farcaster FID (users must follow this account)
  TARGET_FID: Number(process.env.NEXT_PUBLIC_FARCASTER_TARGET_FID) || 0,
  // Cast hash that users must recast (without 0x prefix)
  TARGET_CAST_HASH: process.env.NEXT_PUBLIC_FARCASTER_TARGET_CAST || '',
  // Display username for UI
  TARGET_USERNAME: process.env.NEXT_PUBLIC_FARCASTER_TARGET_USERNAME || 'basefor',
} as const;
