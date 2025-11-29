"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { useOnchainWallet, useChainAlignment } from "@onchainfi/connect";
import { parseEventLogs } from "viem";
import { toast } from "sonner";
import { WHATISBASEFOR_ABI } from "@/abi/WhatIsBaseFor.abi";
import { CONTRACTS, MESSAGES, MINT_LIMITS } from "@/lib/config";
import { useX402Payment } from "@/hooks/useX402Payment";
import { Header } from "@/components/Header";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TokenDisplay } from "@/components/TokenDisplay";
import { MintSection } from "@/components/MintSection";
import { SuccessModal } from "@/components/SuccessModal";
import { FloatingDock, DockItem } from "@/components/ui/floating-dock";
import { ProfileBadge } from "@/components/ProfileBadge";
import { PendingMintsBanner } from "@/components/PendingMintsBanner";
import { usePendingMints, type PendingMint } from "@/hooks/usePendingMints";
import { useFarcaster } from "@/contexts/FarcasterContext";

const SHARE_TEXT = "What is Base means for you?";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://basefor.geoart.studio";

interface HomeContentProps {
  /** True when running inside Farcaster MiniApp */
  isMiniApp?: boolean;
  /** Callback for Farcaster share in MiniApp mode (uses sdk.actions.composeCast) */
  onFarcasterShare?: () => void;
  /** Callback for opening external URLs in MiniApp mode (uses sdk.actions.openUrl) */
  onOpenUrl?: (url: string) => void;
  /** Log prefix for debugging */
  logPrefix?: string;
}

/**
 * HomeContent - Shared UI for both Web and MiniApp modes
 * Only dock items differ based on mode
 */
export function HomeContent({ isMiniApp = false, onFarcasterShare, onOpenUrl, logPrefix = "[Home]" }: HomeContentProps) {
  // Farcaster context for MiniApp wallet
  const { isFarcaster, wallet: fcWallet } = useFarcaster();
  // Privy/Onchain wallet for web mode
  const { isConnected: privyConnected, address: privyAddress } = useOnchainWallet();

  // Unified connection state: use Farcaster wallet in MiniApp, Privy in web
  const isConnected = isFarcaster ? fcWallet.isConnected : privyConnected;
  const address = (isFarcaster ? fcWallet.address : privyAddress) as `0x${string}` | undefined;

  // Chain alignment - ensures wallet is on Base network
  const { needsSwitch, promptSwitch, isSwitching } = useChainAlignment('base');
  const hasPromptedSwitch = useRef(false);

  // Auto-switch to Base when connected on wrong chain (once per session)
  useEffect(() => {
    if (isConnected && needsSwitch && !isSwitching && !hasPromptedSwitch.current) {
      hasPromptedSwitch.current = true;
      promptSwitch();
    }
    // Reset flag when user disconnects
    if (!isConnected) {
      hasPromptedSwitch.current = false;
    }
  }, [isConnected, needsSwitch, isSwitching, promptSwitch]);

  const [phrases, setPhrases] = useState(["", "", ""]);
  const [mintType, setMintType] = useState<"regular" | "custom" | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [animationUrl, setAnimationUrl] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    paymentHeader: string;
  } | null>(null);
  const [retryingMint, setRetryingMint] = useState<PendingMint | null>(null);
  const processedReceiptRef = useRef<string | null>(null);

  const {
    data: hash,
    writeContract,
    isPending,
    error: writeError,
    isError: isWriteError,
    reset: resetWrite
  } = useWriteContract();
  const { recordMintSuccess, updateMintStatus } = useX402Payment();
  const { pendingMints, refetch: refetchPendingMints } = usePendingMints(address);

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
    error: receiptError,
    isError: isReceiptError,
  } = useWaitForTransactionReceipt({ hash });

  // Contract reads
  const { data: tokenURI } = useReadContract({
    address: CONTRACTS.WHATISBASEFOR,
    abi: WHATISBASEFOR_ABI,
    functionName: "tokenURI",
    args: mintedTokenId ? [mintedTokenId] : undefined,
    query: { enabled: !!mintedTokenId },
  });

  const { data: regularMinted = 0n } = useReadContract({
    address: CONTRACTS.WHATISBASEFOR,
    abi: WHATISBASEFOR_ABI,
    functionName: "mintedRegularPerWallet",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: customMinted = 0n } = useReadContract({
    address: CONTRACTS.WHATISBASEFOR,
    abi: WHATISBASEFOR_ABI,
    functionName: "mintedCustomPerWallet",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalSupply = 0n } = useReadContract({
    address: CONTRACTS.WHATISBASEFOR,
    abi: WHATISBASEFOR_ABI,
    functionName: "totalSupply",
  });

  const { data: maxSupply = 0n } = useReadContract({
    address: CONTRACTS.WHATISBASEFOR,
    abi: WHATISBASEFOR_ABI,
    functionName: "MAX_SUPPLY",
  });

  const { data: isPaused = false } = useReadContract({
    address: CONTRACTS.WHATISBASEFOR,
    abi: WHATISBASEFOR_ABI,
    functionName: "paused",
  });

  // Validation state
  const regularMintedCount = Number(regularMinted);
  const alreadyMintedRegular = regularMintedCount >= MINT_LIMITS.MAX_REGULAR_MINT;
  const remainingCustomMints = MINT_LIMITS.MAX_CUSTOM_MINT - Number(customMinted);
  const isSoldOut = maxSupply > 0n && totalSupply >= maxSupply;

  // URL constants for dock items
  const OPENSEA_URL = `https://opensea.io/assets/base/${CONTRACTS.WHATISBASEFOR}`;
  const ONCHAINCHECKER_URL = `https://onchainchecker.xyz/collection/base/${CONTRACTS.WHATISBASEFOR}/0`;
  const FARCASTER_SHARE_URL = `https://warpcast.com/~/compose?text=${encodeURIComponent(SHARE_TEXT)}&embeds[]=${encodeURIComponent(APP_URL)}`;
  const X_SHARE_URL = `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(APP_URL)}`;

  // Build dock items based on mode
  // MiniApp: use sdk.actions.openUrl() for external links, sdk.actions.composeCast() for Farcaster share
  // Web: use regular href links
  const dockItems: DockItem[] = [
    isMiniApp && onOpenUrl
      ? {
          title: "OpenSea",
          icon: <Image src="/opensea_logo.svg" alt="OpenSea" width={24} height={24} className="h-full w-full" />,
          onClick: () => onOpenUrl(OPENSEA_URL),
        }
      : {
          title: "OpenSea",
          icon: <Image src="/opensea_logo.svg" alt="OpenSea" width={24} height={24} className="h-full w-full" />,
          href: OPENSEA_URL,
        },
    isMiniApp && onOpenUrl
      ? {
          title: "OnChainChecker",
          icon: <Image src="/onchainchecker_logo.svg" alt="OnChainChecker" width={24} height={24} className="h-full w-full" />,
          onClick: () => onOpenUrl(ONCHAINCHECKER_URL),
        }
      : {
          title: "OnChainChecker",
          icon: <Image src="/onchainchecker_logo.svg" alt="OnChainChecker" width={24} height={24} className="h-full w-full" />,
          href: ONCHAINCHECKER_URL,
        },
    // Farcaster share: use SDK composeCast in MiniApp, URL in Web
    isMiniApp && onFarcasterShare
      ? {
          title: "Share on Farcaster",
          icon: <Image src="/farcster_new_logo.svg" alt="Share on Farcaster" width={24} height={24} className="h-full w-full" />,
          onClick: onFarcasterShare,
        }
      : {
          title: "Share on Farcaster",
          icon: <Image src="/farcster_new_logo.svg" alt="Share on Farcaster" width={24} height={24} className="h-full w-full" />,
          href: FARCASTER_SHARE_URL,
        },
    isMiniApp && onOpenUrl
      ? {
          title: "Share on X",
          icon: <Image src="/twitter_logo.svg" alt="Share on X" width={24} height={24} className="h-full w-full" />,
          onClick: () => onOpenUrl(X_SHARE_URL),
        }
      : {
          title: "Share on X",
          icon: <Image src="/twitter_logo.svg" alt="Share on X" width={24} height={24} className="h-full w-full" />,
          href: X_SHARE_URL,
        },
  ];

  // Handle regular mint
  const handleRegularMint = async () => {
    if (!isConnected) {
      toast.error(MESSAGES.CONNECT_WALLET);
      return;
    }
    // Check chain alignment - prompt switch if needed
    if (needsSwitch) {
      toast.info("Please switch to Base network to mint");
      await promptSwitch();
      return;
    }
    if (isPaused) {
      toast.error("Minting is currently paused. Please try again later.");
      return;
    }
    if (isSoldOut) {
      toast.error("Collection is sold out!");
      return;
    }
    if (alreadyMintedRegular) {
      toast.error(`You've already minted your free NFTs (${MINT_LIMITS.MAX_REGULAR_MINT}/${MINT_LIMITS.MAX_REGULAR_MINT}). Try custom mint instead!`);
      return;
    }

    setMintType("regular");
    writeContract({
      address: CONTRACTS.WHATISBASEFOR,
      abi: WHATISBASEFOR_ABI,
      functionName: "mint",
    });
  };

  // Handle custom mint - Step 3: Execute on-chain mint (payment already settled)
  const handleCustomMint = async (payment: { paymentId: string; paymentHeader: string }) => {
    // Check chain alignment - prompt switch if needed
    if (needsSwitch) {
      toast.info("Please switch to Base network to mint");
      await promptSwitch();
      return;
    }

    setPaymentData(payment);

    // Wrap phrases with curly braces for contract (lowercase for consistency)
    const wrappedPhrase1 = phrases[0] ? `[${phrases[0].toUpperCase()}]` : "";
    const wrappedPhrase2 = phrases[1] ? `[${phrases[1].toUpperCase()}]` : "";
    const wrappedPhrase3 = phrases[2] ? `[${phrases[2].toUpperCase()}]` : "";

    console.log(`${logPrefix} Executing on-chain mint...`);
    setMintType("custom");
    writeContract({
      address: CONTRACTS.WHATISBASEFOR,
      abi: WHATISBASEFOR_ABI,
      functionName: "mintWithCustomPhrases",
      args: [wrappedPhrase1, wrappedPhrase2, wrappedPhrase3],
    });
  };

  // Handle retry mint - for failed mints that were already paid
  const handleRetryMint = async (pendingMint: PendingMint) => {
    // Check chain alignment - prompt switch if needed
    if (needsSwitch) {
      toast.info("Please switch to Base network to mint");
      await promptSwitch();
      return;
    }
    if (isPaused) {
      toast.error("Minting is currently paused. Please try again later.");
      return;
    }
    if (isSoldOut) {
      toast.error("Collection is sold out!");
      return;
    }

    setRetryingMint(pendingMint);
    setPaymentData({
      paymentId: pendingMint.paymentId,
      paymentHeader: '', // Not needed for retry
    });

    // Wrap phrases with brackets (same as handleCustomMint)
    const phrase1 = pendingMint.phrases[0] ? `[${pendingMint.phrases[0].toUpperCase()}]` : "";
    const phrase2 = pendingMint.phrases[1] ? `[${pendingMint.phrases[1].toUpperCase()}]` : "";
    const phrase3 = pendingMint.phrases[2] ? `[${pendingMint.phrases[2].toUpperCase()}]` : "";

    console.log(`${logPrefix} Retrying mint for payment:`, pendingMint.paymentId);
    setMintType("custom");
    writeContract({
      address: CONTRACTS.WHATISBASEFOR,
      abi: WHATISBASEFOR_ABI,
      functionName: "mintWithCustomPhrases",
      args: [phrase1, phrase2, phrase3],
    });
  };

  // Handle mint success - Step 4: Record mint in database
  useEffect(() => {
    if (!receipt || !isSuccess) return;

    // Guard: skip if already processed this receipt (prevents re-render loop)
    if (processedReceiptRef.current === receipt.transactionHash) return;
    processedReceiptRef.current = receipt.transactionHash;

    const handleMintSuccess = async () => {
      try {
        const logs = parseEventLogs({
          abi: WHATISBASEFOR_ABI,
          eventName: "Transfer",
          logs: receipt.logs,
        });

        if (logs.length > 0 && logs[0].args.tokenId) {
          const tokenId = logs[0].args.tokenId;
          const txHash = receipt.transactionHash;

          setMintedTokenId(tokenId);
          setShowModal(true);

          // Record mint success in database (payment was already settled pre-mint)
          if (paymentData && mintType === "custom") {
            console.log(`${logPrefix} Recording mint success...`);
            try {
              await recordMintSuccess(paymentData.paymentId, tokenId, txHash);
              console.log(`${logPrefix} Mint recorded successfully`);
            } catch (error) {
              console.error(`${logPrefix} Failed to record mint:`, error);
              // Non-critical - mint already succeeded on-chain
            }
          }
        }
      } catch (error) {
        console.error("Error parsing transaction logs:", error);
        if (paymentData && mintType === "custom") {
          await updateMintStatus(
            paymentData.paymentId,
            "failed",
            error instanceof Error ? error.message : "Unknown error",
            "MINT_FAILED"
          );
        }
      }
    };

    handleMintSuccess();
  }, [receipt, isSuccess, paymentData, mintType, recordMintSuccess, updateMintStatus, logPrefix]);

  // Handle mint failure - covers both writeContract rejection and tx revert
  useEffect(() => {
    // Skip if no payment in progress or not a custom mint
    if (!paymentData || mintType !== "custom") return;

    // Check for either type of error
    const hasError = isWriteError || isReceiptError;
    if (!hasError) return;

    const errorMessage = writeError?.message || receiptError?.message || "Transaction failed";

    const handleMintFailure = async () => {
      console.error(`${logPrefix} Mint failed:`, errorMessage);

      try {
        await updateMintStatus(
          paymentData.paymentId,
          "failed",
          errorMessage,
          isWriteError ? "WRITE_CONTRACT_ERROR" : "TX_REVERTED"
        );
        await refetchPendingMints();
        toast.error("Mint failed. You can retry without paying again.");
      } catch (err) {
        console.error(`${logPrefix} Failed to update status:`, err);
      }

      // Reset states
      setPaymentData(null);
      setRetryingMint(null);
      resetWrite();
    };

    handleMintFailure();
  }, [isWriteError, isReceiptError, writeError, receiptError, paymentData, mintType, updateMintStatus, refetchPendingMints, resetWrite, logPrefix]);

  // Parse tokenURI for animation_url (animated SVG)
  useEffect(() => {
    if (!tokenURI || typeof tokenURI !== "string") return;

    try {
      const base64Data = tokenURI.split(",")[1];
      const jsonData = JSON.parse(atob(base64Data));
      // Use animation_url for animated SVG, fallback to image
      if (jsonData.animation_url) {
        setAnimationUrl(jsonData.animation_url);
      } else if (jsonData.image) {
        setAnimationUrl(jsonData.image);
      }
    } catch (error) {
      console.error("Error parsing tokenURI:", error);
    }
  }, [tokenURI]);

  // Handle modal close
  const handleModalClose = () => {
    setShowModal(false);
    setPhrases(["", "", ""]);
    setMintType(null);
    setMintedTokenId(null);
    setAnimationUrl("");
    setPaymentData(null);
    setRetryingMint(null);
    // Note: Don't reset processedReceiptRef - wagmi keeps old receipt, resetting would break guard
    // Refetch pending mints in case a retry succeeded
    refetchPendingMints();
  };

  const isProcessing = isPending || isConfirming || isSwitching;

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#0a0b0d]">
      <Header />

      <div className="relative h-[25vh]">
        <AudioVisualizer />
      </div>

      <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-4 md:px-6 md:py-6 -mt-[25vh]">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end space-y-3">
              <TokenDisplay />
              <div className="w-full max-w-md flex justify-center">
                <FloatingDock items={dockItems} />
              </div>
            </div>

            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start">
              <div className="w-full max-w-md space-y-6">
                {/* Pending mints banner - show if user has failed mints to retry */}
                {pendingMints.length > 0 && (
                  <PendingMintsBanner
                    pendingMints={pendingMints}
                    isRetrying={!!retryingMint && isProcessing}
                    onRetry={handleRetryMint}
                  />
                )}

                <MintSection
                  isConnected={isConnected}
                  isProcessing={isProcessing}
                  mintType={mintType}
                  phrases={phrases}
                  alreadyMintedRegular={alreadyMintedRegular}
                  regularMintedCount={regularMintedCount}
                  maxRegularMints={MINT_LIMITS.MAX_REGULAR_MINT}
                  remainingCustomMints={remainingCustomMints}
                  isPaused={isPaused}
                  isSoldOut={isSoldOut}
                  walletAddress={address}
                  onPhrasesChange={setPhrases}
                  onRegularMint={handleRegularMint}
                  onCustomMint={handleCustomMint}
                />
              </div>
            </div>
          </div>

          {showModal && mintedTokenId && hash && (
            <SuccessModal
              isOpen={showModal}
              onClose={handleModalClose}
              tokenId={mintedTokenId}
              hash={hash}
              imageUrl={animationUrl}
            />
          )}
        </div>
      </main>

      <ProfileBadge />
    </div>
  );
}
