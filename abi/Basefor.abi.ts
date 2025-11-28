/**
 * Basefor NFT Contract ABI
 *
 * Generated from compiled Solidity contract
 * Deployed on Base Mainnet & Base Sepolia with 100% FREE MINTING (no payment required)
 * Last updated: 2025-11-28
 *
 * Latest Features:
 * - ERC721Enumerable implementation for full token enumeration support
 * - Canvas cloud animation with dynamic text roller (3 phrases)
 * - 100% on-chain metadata generation
 * - Custom phrases for token #0: {me}, {you}, {all of us}
 * - Token #0 colorful text: blue, lighter blue, tan/beige
 * - Optimized tiny preview SVG (~3.9 KB) for Blockscout compatibility
 * - Initial mint of 20 NFTs (tokens #0-19)
 * - Dual format NFT: Tiny static SVG preview + Animated HTML
 * - contractURI() for collection metadata
 * - Completely free minting (no payment required)
 * - User custom phrases: mint with your own 1-3 phrases (empty strings auto-fill with random)
 * - Partial phrase support: provide 1-3 custom phrases, empty slots use random phrases
 * - Separate mint limits: 3 predefined phrase mints, 20 custom phrase mints per wallet
 * - Token enumeration: tokenByIndex(), tokenOfOwnerByIndex(), totalSupply()
 * - Interface support: ERC-165, ERC-721, ERC-721 Enumerable, ERC-721 Metadata, ERC-173, ERC-2981, ERC-7572
 */

export const BASEFOR_ABI = [{ "type": "constructor", "inputs": [{ "name": "_phrasesContract", "type": "address", "internalType": "address" }, { "name": "_initialRecipient", "type": "address", "internalType": "address" }], "stateMutability": "nonpayable" }, { "type": "function", "name": "MAX_MINT", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "MAX_SUPPLY", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "approve", "inputs": [{ "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "balanceOf", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "contractURI", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "getApproved", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "isApprovedForAll", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "operator", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "mint", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "mintWithCustomPhrases", "inputs": [{ "name": "phrase1", "type": "string", "internalType": "string" }, { "name": "phrase2", "type": "string", "internalType": "string" }, { "name": "phrase3", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "mintedCustomPerWallet", "inputs": [{ "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "mintedRegularPerWallet", "inputs": [{ "name": "", "type": "address", "internalType": "address" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "name", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "owner", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "ownerOf", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "address", "internalType": "address" }], "stateMutability": "view" }, { "type": "function", "name": "ownersMint", "inputs": [{ "name": "recipients", "type": "address[]", "internalType": "address[]" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "pause", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "paused", "inputs": [], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "phrasesContract", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "contract IBaseforPhrasesRegistry" }], "stateMutability": "view" }, { "type": "function", "name": "renderer", "inputs": [], "outputs": [{ "name": "", "type": "address", "internalType": "contract IBaseforRenderer" }], "stateMutability": "view" }, { "type": "function", "name": "renounceOwnership", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "royaltyBasisPoints", "inputs": [], "outputs": [{ "name": "", "type": "uint96", "internalType": "uint96" }], "stateMutability": "view" }, { "type": "function", "name": "royaltyInfo", "inputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }, { "name": "salePrice", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "receiver", "type": "address", "internalType": "address" }, { "name": "royaltyAmount", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "safeTransferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "safeTransferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "data", "type": "bytes", "internalType": "bytes" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setApprovalForAll", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }, { "name": "approved", "type": "bool", "internalType": "bool" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setMaxMint", "inputs": [{ "name": "_max", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setMaxSupply", "inputs": [{ "name": "_supply", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setRenderer", "inputs": [{ "name": "_renderer", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setRoyalty", "inputs": [{ "name": "_basisPoints", "type": "uint96", "internalType": "uint96" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "setTokenPhrases", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "phrase1", "type": "string", "internalType": "string" }, { "name": "phrase2", "type": "string", "internalType": "string" }, { "name": "phrase3", "type": "string", "internalType": "string" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "supportsInterface", "inputs": [{ "name": "interfaceId", "type": "bytes4", "internalType": "bytes4" }], "outputs": [{ "name": "", "type": "bool", "internalType": "bool" }], "stateMutability": "view" }, { "type": "function", "name": "symbol", "inputs": [], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "tokenByIndex", "inputs": [{ "name": "index", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "tokenOfOwnerByIndex", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "index", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "tokenURI", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [{ "name": "", "type": "string", "internalType": "string" }], "stateMutability": "view" }, { "type": "function", "name": "totalSupply", "inputs": [], "outputs": [{ "name": "", "type": "uint256", "internalType": "uint256" }], "stateMutability": "view" }, { "type": "function", "name": "transferFrom", "inputs": [{ "name": "from", "type": "address", "internalType": "address" }, { "name": "to", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "transferOwnership", "inputs": [{ "name": "newOwner", "type": "address", "internalType": "address" }], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "unpause", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "function", "name": "withdraw", "inputs": [], "outputs": [], "stateMutability": "nonpayable" }, { "type": "event", "name": "Approval", "inputs": [{ "name": "owner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "approved", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "ApprovalForAll", "inputs": [{ "name": "owner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "operator", "type": "address", "indexed": true, "internalType": "address" }, { "name": "approved", "type": "bool", "indexed": false, "internalType": "bool" }], "anonymous": false }, { "type": "event", "name": "Minted", "inputs": [{ "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }, { "name": "phrase", "type": "string", "indexed": false, "internalType": "string" }], "anonymous": false }, { "type": "event", "name": "MintedCustom", "inputs": [{ "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "OwnershipTransferred", "inputs": [{ "name": "previousOwner", "type": "address", "indexed": true, "internalType": "address" }, { "name": "newOwner", "type": "address", "indexed": true, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "Paused", "inputs": [{ "name": "account", "type": "address", "indexed": false, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "Transfer", "inputs": [{ "name": "from", "type": "address", "indexed": true, "internalType": "address" }, { "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "tokenId", "type": "uint256", "indexed": true, "internalType": "uint256" }], "anonymous": false }, { "type": "event", "name": "Unpaused", "inputs": [{ "name": "account", "type": "address", "indexed": false, "internalType": "address" }], "anonymous": false }, { "type": "event", "name": "Withdrawn", "inputs": [{ "name": "to", "type": "address", "indexed": true, "internalType": "address" }, { "name": "amount", "type": "uint256", "indexed": false, "internalType": "uint256" }], "anonymous": false }, { "type": "error", "name": "ERC721EnumerableForbiddenBatchMint", "inputs": [] }, { "type": "error", "name": "ERC721IncorrectOwner", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }, { "name": "owner", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InsufficientApproval", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }, { "name": "tokenId", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "ERC721InvalidApprover", "inputs": [{ "name": "approver", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidOperator", "inputs": [{ "name": "operator", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidReceiver", "inputs": [{ "name": "receiver", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721InvalidSender", "inputs": [{ "name": "sender", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ERC721NonexistentToken", "inputs": [{ "name": "tokenId", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "ERC721OutOfBoundsIndex", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }, { "name": "index", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "EnforcedPause", "inputs": [] }, { "type": "error", "name": "ExpectedPause", "inputs": [] }, { "type": "error", "name": "InvalidPhrase", "inputs": [] }, { "type": "error", "name": "MaxMintsReached", "inputs": [] }, { "type": "error", "name": "NonexistentToken", "inputs": [] }, { "type": "error", "name": "OwnableInvalidOwner", "inputs": [{ "name": "owner", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "OwnableUnauthorizedAccount", "inputs": [{ "name": "account", "type": "address", "internalType": "address" }] }, { "type": "error", "name": "ReentrancyGuardReentrantCall", "inputs": [] }, { "type": "error", "name": "SoldOut", "inputs": [] }, { "type": "error", "name": "StringsInsufficientHexLength", "inputs": [{ "name": "value", "type": "uint256", "internalType": "uint256" }, { "name": "length", "type": "uint256", "internalType": "uint256" }] }, { "type": "error", "name": "WithdrawFailed", "inputs": [] }] as const;

/**
 * Contract deployment addresses across different networks
 * Last updated: 2025-11-28
 *
 * Basefor: A fully onchain collection of base spirits with 3-phrase animation
 */
export const CONTRACT_ADDRESSES = {
  baseMainnet: {
    chainId: 8453,
    basefor: '0xb276A2A0f963cFE45f786f8F909fc39aff2ae087', // Main NFT contract (3-phrase system, tiny preview SVG, ERC721Enumerable)
    assets: '0x898c5cEe09822dc89BCca7c7Bc34F994079b0539', // Assets contract (3-phrase CSS)
    renderer: '0x9496d0CC439647b1C7131C549b1d6EC6b8459b22', // Renderer contract (6 params: 3 phrases, 3 colors)
    phrases: '0x0938a5307B09fe9F973e72881bC55e172e2D5c1c', // Phrases registry
    initialRecipient: '0x168D8b4f50BB3aA67D05a6937B643004257118ED', // Received initial 20 NFTs + Owner
    explorer: 'https://base.blockscout.com',
    basescan: 'https://basescan.org',
    maxSupply: 50000,
    maxPerWallet: 23,
    maxRegularMint: 3, // Predefined phrases: max 3 mints
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
  basefor: `0x${string}`;
  assets: `0x${string}`;
  renderer: `0x${string}`;
  phrases: `0x${string}`;
  initialRecipient: `0x${string}`;
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
  MAX_LENGTH: 64,
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
