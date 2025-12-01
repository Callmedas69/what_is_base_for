'use client';

import { useState, useEffect } from 'react';
import { useOnchainWallet } from '@onchainfi/connect';
import { Wallet } from 'lucide-react';
import { useFarcaster } from '@/contexts/FarcasterContext';

interface CustomWalletConnectProps {
  className?: string;
}

export function CustomWalletConnect({ className }: CustomWalletConnectProps) {
  // Farcaster wallet from global context (auto-connects in MiniApp)
  const { isFarcaster, wallet: fcWallet } = useFarcaster();
  // OnchainConnect wallet for web mode (Privy)
  // user object exists only when authenticated through Privy (not wagmi auto-detect)
  const { isConnected: privyConnected, address: privyAddress, user, login, logout } = useOnchainWallet();

  const [showMenu, setShowMenu] = useState(false);

  // Only show as connected if Privy has a session (not just wagmi auto-detect)
  // This prevents confusion when multiple wallets are installed
  const hasPrivySession = !!user;
  const isConnected = isFarcaster ? fcWallet.isConnected : (privyConnected && hasPrivySession);
  const address = isFarcaster ? fcWallet.address : (hasPrivySession ? privyAddress : undefined);

  function handleClick() {
    if (isConnected) {
      setShowMenu(!showMenu);
      return;
    }

    // In MiniApp, wallet auto-connects via FarcasterContext
    // In web, trigger Privy login modal
    if (!isFarcaster && login) {
      login();
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;

    function handleClickOutside(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest('.wallet-menu-container')) {
        setShowMenu(false);
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  const short = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : null;

  return (
    <div className="relative wallet-menu-container">
      <button
        onClick={handleClick}
        className={className || "p-2 text-[#0a0b0d] hover:text-gray-600 transition"}
      >
        <Wallet className="w-5 h-5" strokeWidth={2} />
      </button>

      {showMenu && isConnected && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px] z-50">
          <div className="px-3 py-2 text-sm text-gray-500 border-b">{short}</div>
          {!isFarcaster && (
            <button
              onClick={() => { logout?.(); setShowMenu(false); }}
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              Disconnect
            </button>
          )}
          <button
            onClick={() => setShowMenu(false)}
            className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
