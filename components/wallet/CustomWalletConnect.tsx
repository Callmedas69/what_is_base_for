'use client';

import { useFarcaster } from '@/contexts/FarcasterContext';
import { WebWalletConnect } from './WebWalletConnect';
import { MiniAppWalletConnect } from './MiniAppWalletConnect';

interface CustomWalletConnectProps {
  className?: string;
}

/**
 * CustomWalletConnect - Smart wrapper that renders the correct wallet component
 *
 * This component ONLY checks isFarcaster and delegates to:
 * - MiniApp mode: MiniAppWalletConnect (uses FarcasterContext)
 * - Web mode: WebWalletConnect (uses OnchainConnect/Privy)
 *
 * This separation prevents both wallet hooks from running in the same component,
 * which was causing infinite re-renders.
 */
export function CustomWalletConnect({ className }: CustomWalletConnectProps) {
  const { isFarcaster } = useFarcaster();

  if (isFarcaster) {
    return <MiniAppWalletConnect className={className} />;
  }

  return <WebWalletConnect className={className} />;
}
