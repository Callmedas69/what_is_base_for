'use client';

import { useState, useEffect } from 'react';
import { Wallet } from 'lucide-react';
import { useFarcaster } from '@/contexts/FarcasterContext';

interface MiniAppWalletConnectProps {
  className?: string;
}

/**
 * MiniApp Wallet Connect - Uses FarcasterContext for MiniApp mode only
 * Does NOT import or use OnchainConnect wallet to avoid hook conflicts
 */
export function MiniAppWalletConnect({ className }: MiniAppWalletConnectProps) {
  const { wallet } = useFarcaster();

  const [showMenu, setShowMenu] = useState(false);

  const isConnected = wallet.isConnected;
  const address = wallet.address;

  function handleClick() {
    if (isConnected) {
      setShowMenu(!showMenu);
    }
    // MiniApp wallet auto-connects, no manual connect needed
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
        className={className || "flex items-center p-2 text-[#0a0b0d] hover:text-gray-600 transition"}
      >
        <Wallet className="w-5 h-5 sm:hidden" strokeWidth={2} />
        <span className="hidden sm:inline text-sm font-medium">
          {isConnected ? short : "Connecting..."}
        </span>
      </button>

      {showMenu && isConnected && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px] z-50">
          <div className="px-3 py-2 text-sm text-gray-500 border-b">{short}</div>
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
