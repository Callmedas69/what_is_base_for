"use client";

import { useState, useEffect } from "react";
import { usePrivy, useLogin, useLogout } from "@privy-io/react-auth";
import { useAccount, useDisconnect, useConnect, useChainId, useSwitchChain } from "wagmi";
import { IconWallet, IconX, IconCopy, IconCheck } from "@tabler/icons-react";
import { CHAIN_CONFIG } from "@/lib/config";

interface ConnectButtonProps {
  className?: string;
}

export function ConnectButton({ className }: ConnectButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const { authenticated, user, ready } = usePrivy();
  const { login } = useLogin();
  const { logout } = useLogout();
  const { address: wagmiAddress, isConnected: wagmiConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect, isPending } = useConnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const displayAddress = user?.wallet?.address || wagmiAddress;
  const isConnected = authenticated || wagmiConnected;

  // Auto-switch to Base Mainnet if connected on wrong chain
  useEffect(() => {
    if (isConnected && chainId && chainId !== CHAIN_CONFIG.CHAIN_ID) {
      switchChain({ chainId: CHAIN_CONFIG.CHAIN_ID });
    }
  }, [isConnected, chainId, switchChain]);

  const handleFarcasterLogin = () => {
    login({ loginMethods: ["farcaster"] });
    setShowModal(false);
  };

  const handleWalletConnect = (connector: typeof connectors[number]) => {
    connect({ connector });
    setShowModal(false);
  };

  const handleDisconnect = () => {
    if (authenticated) logout();
    if (wagmiConnected) disconnect();
    setShowModal(false);
  };

  const copyAddress = async () => {
    if (displayAddress) {
      await navigator.clipboard.writeText(displayAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  if (!ready) {
    return (
      <button
        className={`px-4 py-2 rounded-full border border-[#dee1e7] bg-white text-sm font-medium text-[#5b616e] ${className}`}
        disabled
      >
        Loading...
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => (isConnected ? setShowModal(true) : setShowModal(true))}
        className={`flex items-center gap-2 px-4 py-2 rounded-full border border-[#dee1e7] bg-white hover:bg-gray-50 transition-colors ${className}`}
      >
        <IconWallet size={18} className="text-[#0a0b0d]" />
        <span className="text-sm font-medium text-[#0a0b0d]">
          {isConnected && displayAddress
            ? formatAddress(displayAddress)
            : "Connect"}
        </span>
      </button>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div
            className="relative bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#0a0b0d]">
                {isConnected ? "Connected" : "Connect Wallet"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#5b616e] hover:text-[#0a0b0d] transition-colors"
              >
                <IconX size={24} />
              </button>
            </div>

            {/* Connected State */}
            {isConnected && displayAddress && (
              <div className="mb-6 bg-gray-50 border border-[#dee1e7] rounded-lg p-4">
                <p className="text-xs text-[#5b616e] mb-2 uppercase tracking-wider">
                  Your Wallet
                </p>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm text-[#0a0b0d] font-mono break-all">
                    {displayAddress}
                  </code>
                  <button
                    onClick={copyAddress}
                    className="flex-shrink-0 p-2 hover:bg-gray-100 rounded transition-colors"
                  >
                    {copied ? (
                      <IconCheck size={16} className="text-green-600" />
                    ) : (
                      <IconCopy size={16} className="text-[#5b616e]" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Disconnect Button */}
            {isConnected && (
              <button
                onClick={handleDisconnect}
                className="w-full mb-6 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-600 font-medium hover:bg-red-100 transition-colors"
              >
                Disconnect
              </button>
            )}

            {/* Login Options */}
            {!isConnected && (
              <div className="space-y-3">
                {/* Farcaster */}
                <button
                  onClick={handleFarcasterLogin}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[#dee1e7] bg-white hover:bg-gray-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-purple-600"
                    >
                      <path
                        d="M18.24 3H5.76A2.76 2.76 0 003 5.76v12.48A2.76 2.76 0 005.76 21h12.48A2.76 2.76 0 0021 18.24V5.76A2.76 2.76 0 0018.24 3z"
                        fill="currentColor"
                      />
                      <path
                        d="M8 8.5h8v7H8v-7z"
                        fill="white"
                      />
                    </svg>
                  </div>
                  <span className="text-[#0a0b0d] font-medium">
                    Sign in with Farcaster
                  </span>
                </button>

                {/* Divider */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#dee1e7]" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-[#5b616e]">
                      Or connect wallet
                    </span>
                  </div>
                </div>

                {/* Wallet Connectors */}
                {connectors.map((connector) => (
                  <button
                    key={connector.id}
                    onClick={() => handleWalletConnect(connector)}
                    disabled={isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[#dee1e7] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <IconWallet size={18} className="text-blue-600" />
                    </div>
                    <span className="text-[#0a0b0d] font-medium">
                      {connector.name}
                    </span>
                    {isPending && (
                      <div className="ml-auto w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
