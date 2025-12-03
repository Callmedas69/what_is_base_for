'use client';

import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { Wallet } from 'lucide-react';

interface WebWalletConnectProps {
  className?: string;
}

/**
 * Web Wallet Connect - Uses RainbowKit + Wagmi for web mode only
 * Does NOT import or use FarcasterContext to avoid hook conflicts
 */
export function WebWalletConnect({ className }: WebWalletConnectProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { openConnectModal } = useConnectModal();

  const [showMenu, setShowMenu] = useState(false);

  const displayAddress = isConnected ? address : undefined;

  function handleClick() {
    if (isConnected) {
      setShowMenu(!showMenu);
      return;
    }
    openConnectModal?.();
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

  const short = displayAddress ? `${displayAddress.slice(0, 6)}...${displayAddress.slice(-4)}` : null;

  return (
    <div className="relative wallet-menu-container">
      <button
        onClick={handleClick}
        className={className || "flex items-center p-2 text-[#0a0b0d] hover:text-gray-600 transition"}
      >
        <Wallet className="w-5 h-5 sm:hidden" strokeWidth={2} />
        <span className="hidden sm:inline text-sm font-medium">
          {isConnected ? short : "Connect Wallet"}
        </span>
      </button>

      {showMenu && isConnected && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px] z-50">
          <div className="px-3 py-2 text-sm text-gray-500 border-b">{short}</div>
          <button
            onClick={() => { disconnect(); setShowMenu(false); }}
            className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded"
          >
            Disconnect
          </button>
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
