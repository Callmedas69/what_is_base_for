"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { useOnchainWallet } from "@onchainfi/connect";
import { parseEventLogs } from "viem";
import { BASEFOR_ABI } from "@/abi/Basefor.abi";
import { CONTRACTS, MESSAGES, MINT_LIMITS } from "@/lib/config";
import { useX402Payment } from "@/hooks/useX402Payment";
import { Header } from "@/components/Header";
import { AudioVisualizer } from "@/components/AudioVisualizer";
import { TokenDisplay } from "@/components/TokenDisplay";
import { MintSection } from "@/components/MintSection";
import { SuccessModal } from "@/components/SuccessModal";
import { FloatingDock, DockItem } from "@/components/ui/floating-dock";
import { ProfileBadge } from "@/components/ProfileBadge";

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
  const { isConnected, address: walletAddress } = useOnchainWallet();
  const address = walletAddress as `0x${string}` | undefined;
  const [phrases, setPhrases] = useState(["", "", ""]);
  const [mintType, setMintType] = useState<"regular" | "custom" | null>(null);
  const [mintedTokenId, setMintedTokenId] = useState<bigint | null>(null);
  const [animationUrl, setAnimationUrl] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    paymentHeader: string;
  } | null>(null);

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { settlePayment, updateMintStatus } = useX402Payment();

  const {
    data: receipt,
    isLoading: isConfirming,
    isSuccess,
  } = useWaitForTransactionReceipt({ hash });

  // Contract reads
  const { data: tokenURI } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "tokenURI",
    args: mintedTokenId ? [mintedTokenId] : undefined,
    query: { enabled: !!mintedTokenId },
  });

  const { data: regularMinted = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "mintedRegularPerWallet",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: customMinted = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "mintedCustomPerWallet",
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalSupply = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "totalSupply",
  });

  const { data: maxSupply = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "MAX_SUPPLY",
  });

  const { data: isPaused = false } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "paused",
  });

  // Validation state
  const alreadyMintedRegular = regularMinted >= BigInt(MINT_LIMITS.MAX_REGULAR_MINT);
  const remainingCustomMints = Number(BigInt(MINT_LIMITS.MAX_CUSTOM_MINT) - customMinted);
  const isSoldOut = maxSupply > 0n && totalSupply >= maxSupply;

  // URL constants for dock items
  const OPENSEA_URL = `https://opensea.io/assets/base/${CONTRACTS.BASEFOR}`;
  const ONCHAINCHECKER_URL = `https://onchainchecker.xyz/collection/base/${CONTRACTS.BASEFOR}/0`;
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
  const handleRegularMint = () => {
    if (!isConnected) {
      alert(MESSAGES.CONNECT_WALLET);
      return;
    }
    if (isPaused) {
      alert("Minting is currently paused. Please try again later.");
      return;
    }
    if (isSoldOut) {
      alert("Collection is sold out!");
      return;
    }
    if (alreadyMintedRegular) {
      alert(`You've already minted your free NFTs (${MINT_LIMITS.MAX_REGULAR_MINT}/${MINT_LIMITS.MAX_REGULAR_MINT}). Try custom mint instead!`);
      return;
    }

    setMintType("regular");
    writeContract({
      address: CONTRACTS.BASEFOR,
      abi: BASEFOR_ABI,
      functionName: "mint",
    });
  };

  // Handle custom mint with payment
  const handleCustomMint = async (payment: { paymentId: string; paymentHeader: string }) => {
    setPaymentData(payment);
    try {
      await updateMintStatus(payment.paymentId, "minting");
    } catch (error) {
      console.error(`${logPrefix} Failed to update mint status:`, error);
    }

    const wrappedPhrase1 = phrases[0] ? `{${phrases[0]}}` : "";
    const wrappedPhrase2 = phrases[1] ? `{${phrases[1]}}` : "";
    const wrappedPhrase3 = phrases[2] ? `{${phrases[2]}}` : "";

    setMintType("custom");
    writeContract({
      address: CONTRACTS.BASEFOR,
      abi: BASEFOR_ABI,
      functionName: "mintWithCustomPhrases",
      args: [wrappedPhrase1, wrappedPhrase2, wrappedPhrase3],
    });
  };

  // Handle mint success
  useEffect(() => {
    if (!receipt || !isSuccess) return;

    const handleMintSuccess = async () => {
      try {
        const logs = parseEventLogs({
          abi: BASEFOR_ABI,
          eventName: "Transfer",
          logs: receipt.logs,
        });

        if (logs.length > 0 && logs[0].args.tokenId) {
          const tokenId = logs[0].args.tokenId;
          const txHash = receipt.transactionHash;

          setMintedTokenId(tokenId);
          setShowModal(true);

          if (paymentData && mintType === "custom") {
            console.log(`${logPrefix} Settling payment after successful mint`);
            try {
              await settlePayment(paymentData.paymentId, paymentData.paymentHeader, tokenId, txHash);
              console.log(`${logPrefix} Payment settled successfully`);
            } catch (error) {
              console.error(`${logPrefix} Failed to settle payment:`, error);
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
  }, [receipt, isSuccess, paymentData, mintType, settlePayment, updateMintStatus, logPrefix]);

  // Parse tokenURI for animation_url
  useEffect(() => {
    if (!tokenURI || typeof tokenURI !== "string") return;

    try {
      const base64Data = tokenURI.split(",")[1];
      const jsonData = JSON.parse(atob(base64Data));
      if (jsonData.animation_url) {
        setAnimationUrl(jsonData.animation_url);
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
  };

  const isProcessing = isPending || isConfirming;

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
                <MintSection
                  isConnected={isConnected}
                  isProcessing={isProcessing}
                  mintType={mintType}
                  phrases={phrases}
                  alreadyMintedRegular={alreadyMintedRegular}
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
              animationUrl={animationUrl}
            />
          )}
        </div>
      </main>

      <ProfileBadge />
    </div>
  );
}
