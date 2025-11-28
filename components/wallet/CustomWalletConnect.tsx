'use client';

import { useState, useEffect } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { useOnchainWallet } from '@onchainfi/connect';
import { useFarcaster } from '@/contexts/FarcasterContext';

interface CustomWalletConnectProps {
  className?: string;
}

export function CustomWalletConnect({ className }: CustomWalletConnectProps) {
  const { isFarcaster, isReady } = useFarcaster();
  const { isConnected: privyConnected, address: privyAddress, login, logout } = useOnchainWallet();

  // MiniApp wallet state (only used when isFarcaster)
  const [fcAddress, setFcAddress] = useState<string | undefined>();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Auto-connect in MiniApp mode
  useEffect(() => {
    if (isFarcaster && isReady && !fcAddress) {
      connectFarcaster();
    }
  }, [isFarcaster, isReady, fcAddress]);

  async function connectFarcaster() {
    setIsConnecting(true);
    try {
      const provider = await sdk.wallet.getEthereumProvider();
      if (!provider) return;

      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts?.[0]) {
        setFcAddress(accounts[0]);
      }
    } catch (error) {
      console.error('[CustomWallet] Farcaster connect error:', error);
    } finally {
      setIsConnecting(false);
    }
  }

  // Unified state
  const isConnected = isFarcaster ? !!fcAddress : privyConnected;
  const address = isFarcaster ? fcAddress : privyAddress;

  function handleClick() {
    if (isConnected) {
      setShowMenu(!showMenu);
      return;
    }

    if (isFarcaster) {
      connectFarcaster();
    } else {
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
        disabled={isConnecting}
        className={className || "px-4 py-2 rounded-lg bg-black text-white font-semibold hover:bg-gray-800 transition disabled:opacity-40"}
      >
        {isConnecting ? "Connecting..." : isConnected ? short : "Connect Wallet"}
      </button>

      {showMenu && isConnected && (
        <div className="absolute top-full mt-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 min-w-[160px] z-50">
          <div className="px-3 py-2 text-sm text-gray-500 border-b">{short}</div>
          {!isFarcaster && (
            <button
              onClick={() => { logout(); setShowMenu(false); }}
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
