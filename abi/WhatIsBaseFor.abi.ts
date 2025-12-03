/**
 * WhatIsBaseFor NFT Contract ABI
 *
 * Generated from compiled Solidity contract
 * Deployed on Base Mainnet with 100% FREE MINTING (no payment required)
 * Last updated: 2025-11-30
 *
 * Latest Features:
 * - ERC721Enumerable implementation for full token enumeration support
 * - Interactive 10x10 grid with 16 hover color classes (animation_url)
 * - Static SVG with logo, pill, phrase, tagline (image thumbnail)
 * - 100% on-chain SVG generation with CSS animations
 * - 68 dynamic text colors from WhatIsBaseForAssets
 * - Doto font embedded for phrase rendering
 * - Custom phrases for token #0: {ME}, {YOU}, {ALL OF US}
 * - Token #0 specific colors: #0000FF, #FFD12F, #FC401F
 * - 299 UPPERCASE phrases (max 20 characters)
 * - Initial mint of 20 NFTs (tokens #0-19)
 * - contractURI() for collection metadata
 * - Completely free minting (no payment required)
 * - User custom phrases: mint with your own 1-3 phrases (empty strings auto-fill with random)
 * - Partial phrase support: provide 1-3 custom phrases, empty slots use random phrases
 * - Separate mint limits: 3 predefined phrase mints, 20 custom phrase mints per wallet
 * - Token enumeration: tokenByIndex(), tokenOfOwnerByIndex(), totalSupply()
 * - Interface support: ERC-165, ERC-721, ERC-721 Enumerable, ERC-721 Metadata, ERC-173, ERC-2981, ERC-7572
 */

export const WHATISBASEFOR_ABI = [{ "type": "constructor", "inputs": [{ "name": "_phrasesContract", "type": "address", "internalType": "address" }, { "name": "_initialRecipient", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" }, { "type": "function", "name": "MAX_MINT", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "MAX_SUPPLY", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "approve", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "balanceOf", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "contractURI", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "getApproved", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "isApprovedForAll", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "operator", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "mint", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "mintWithCustomPhrases", "inputs": [{ "name": "phrase1", "type": "string", "internalType": "string" }, { "name": "phrase2", "type": "string", "internalType": "string" }, { "name": "phrase3", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "mintedCustomPerWallet", "inputs": [{ "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "mintedRegularPerWallet", "inputs": [{ "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "name", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "ownerOf", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "ownersMint", "inputs": [{ "name": "recipients", "type": "address[]", "internalType": "address[]" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "pause", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "paused", "inputs": [], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "phrasesContract", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "contract IBaseforPhrasesRegistry" }], "stateMutability": "view" }, { "type": "function", "name": "renderer", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "contract IBaseforRenderer" }], "stateMutability": "view" }, { "type": "function", "name": "renounceOwnership", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "royaltyBasisPoints", "inputs": [], "outputs": [{ "name": "", "type": "uint96", "internalType": "uint96" }], "stateMutability": "view" }, { "type": "function", "name": "royaltyInfo", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }, { "name": "salePrice", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "receiver", "type": "address", "internalType": "address" }, { "name": "royaltyAmount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "safeTransferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "safeTransferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "data", "type": "bytes", "internalType": "bytes" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setApprovalForAll", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }, { "name": "approved", "type": "bool", "internalType": "bool" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setMaxMint", "inputs": [{ "name": "_max", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setMaxSupply", "inputs": [{ "name": "_supply", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setRenderer", "inputs": [{ "name": "_renderer", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setRoyalty", "inputs": [{ "name": "_basisPoints", "type": "uint96", "internalType": "uint96" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setTokenPhrases", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "phrase1", "type": "string", "internalType": "string" }, { "name": "phrase2", "type": "string", "internalType": "string" }, { "name": "phrase3", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "supportsInterface", "inputs": [{ "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "symbol", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "tokenByIndex", "inputs": [{ "name": "index", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "tokenOfOwnerByIndex", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "index", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "tokenURI", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "totalSupply", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "transferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "transferOwnership", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "unpause", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "withdraw", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "event", "name": "Approval", "inputs": [{ "name": "owner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "approved", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "ApprovalForAll", "inputs": [{ "name": "owner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "operator", "type": "address", "indexed": true, "internalType": "address" }, { "name": "approved", "type": "bool", "indexed": false, "internalType": "bool" }], "anonymous": false }, { "type": "event", "name": "Minted", "inputs": [{ "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "phrase", "type": "string", "indexed": false, "internalType": "string" }], "anonymous": false }, { "type": "event", "name": "MintedCustom", "inputs": [{ "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "Paused", "inputs": [{ "name": "account", "type": "address", "indexed": false, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "Transfer", "inputs": [{ "name": "from", "type": "address", "indexed": true, "internalType": "address" }, { "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "Unpaused", "inputs": [{ "name": "account", "type": "address", "indexed": false, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "Withdrawn", "inputs": [{ "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "error", "name": "ERC721EnumerableForbiddenBatchMint", "inputs": [] }, { "type": "error", "name": "ERC721IncorrectOwner", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "owner", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InsufficientApproval", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "ERC721InvalidApprover", "inputs": [{ "name": "approver", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidOperator", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidReceiver", "inputs": [{ "name": "receiver", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidSender", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721NonexistentToken", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "ERC721OutOfBoundsIndex", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "index", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "EnforcedPause", "inputs": [] }, { "type": "error", "name": "ExpectedPause", "inputs": [] }, { "type": "error", "name": "InvalidPhrase", "inputs": [] }, { "type": "error", "name": "MaxMintsReached", "inputs": [] }, { "type": "error", "name": "NonexistentToken", "inputs": [] }, { "type": "error", "name": "OwnableInvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "OwnableUnauthorizedAccount", "inputs": [{ "name": "account", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] }, { "type": "error", "name": "SoldOut", "inputs": [] }, { "type": "error", "name": "StringsInsufficientHexLength", "inputs": [{ "name": "value", "type": "uint256", "internalType": "uint256" }, { "name": "length", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "WithdrawFailed", "inputs": [] }] as const;

/**
 * Contract deployment addresses across different networks
 * Last updated: 2025-11-30
 *
 * WhatIsBaseFor: A fully onchain NFT collection
 * - animation_url: Interactive 10x10 grid with 3-phrase animation
 * - image: Static SVG with logo, pill, phrase 1, tagline (thumbnail)
 */
export const CONTRACT_ADDRESSES = {
  baseMainnet: {
    chainId: 8453,
    whatIsBaseFor: '0x6eE388cEA7D285bbf376d78a106803298404717B', // Main NFT contract (ERC721Enumerable)
    assets: '0x3938b363c7f8c37068FE744aAD71cc466a1200CA', // Assets contract (68 text colors, CSS, static CSS)
    renderer: '0xA5BA4Bf1160F8a284d6FDEe2176359937480B450', // Renderer contract (animated + static SVG)
    phrases: '0x8dcb082AB23B08B7fD24B6f0AF19957aacAFE277', // Phrases registry (299 UPPERCASE phrases)
    owner: '0x168D8b4f50BB3aA67D05a6937B643004257118ED', // Contract owner + received initial 20 NFTs
    explorer: 'https://base.blockscout.com',
    basescan: 'https://basescan.org',
    maxSupply: 50000,
    maxPerWallet: 23,
    maxRegularMint: 1, // Predefined phrases: max 1 free mint
    maxCustomMint: 20, // Custom phrases: max 20 mints
    initialMint: 20 // 20 NFTs minted at deployment (tokens #0-19)
  }
} as const;

/**
 * Type definitions for better TypeScript support
 */
export type ChainName = keyof typeof CONTRACT_ADDRESSES;
export type ContractAddress = (typeof CONTRACT_ADDRESSES)[ChainName];

/**
 * Global Types for Application
 */
export interface ChainConfig {
  chainId: number;
  explorer: string;
  basescan: string;
}

export interface ContractConfig {
  whatIsBaseFor: `0x${string}`;
  assets: `0x${string}`;
  renderer: `0x${string}`;
  phrases: `0x${string}`;
  owner: `0x${string}`;
}

export interface MintLimits {
  maxSupply: number;
  maxPerWallet: number;
  maxRegularMint: number;
  maxCustomMint: number;
  initialMint: number;
}

export interface NetworkConfig extends ChainConfig, ContractConfig, MintLimits { }

/**
 * Phrase validation constants
 */
export const PHRASE_CONSTRAINTS = {
  MIN_LENGTH: 1,
  MAX_LENGTH: 20,
  REQUIRED_COUNT: 3, // Updated to 3 phrases
} as const;

/**
 * Helper function to get contract address for specific chain
 */
export function getContractAddress(
  chain: ChainName,
  contract: keyof ContractConfig
): `0x${string}` {
  return CONTRACT_ADDRESSES[chain][contract];
}

/**
 * Helper function to validate phrase input
 */
export function isValidPhrase(phrase: string): boolean {
  return (
    phrase.length >= PHRASE_CONSTRAINTS.MIN_LENGTH &&
    phrase.length <= PHRASE_CONSTRAINTS.MAX_LENGTH
  );
}

/**
 * Helper function to validate all three phrases
 */
export function areValidPhrases(
  phrase1: string,
  phrase2: string,
  phrase3: string
): boolean {
  return (
    isValidPhrase(phrase1) &&
    isValidPhrase(phrase2) &&
    isValidPhrase(phrase3)
  );
}

/**
 * Backward compatibility alias
 * @deprecated Use WHATISBASEFOR_ABI instead
 */
export const BASEFOR_ABI = WHATISBASEFOR_ABI;
