"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";
import { parseEventLogs } from "viem";
import { BASEFOR_ABI } from "@/abi/Basefor.abi";
import { CONTRACTS, MESSAGES } from "@/lib/config";
import { useX402Payment } from "@/hooks/useX402Payment";
import { Header } from "@/components/Header";
import { TokenDisplay } from "@/components/TokenDisplay";
import { MintSection } from "@/components/MintSection";
import { SuccessModal } from "@/components/SuccessModal";

export default function Home() {
  const { isConnected, address } = useAccount();
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
  } = useWaitForTransactionReceipt({
    hash,
  });

  // Read tokenURI for minted NFT
  const { data: tokenURI } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "tokenURI",
    args: mintedTokenId ? [mintedTokenId] : undefined,
    query: {
      enabled: !!mintedTokenId,
    },
  });

  // Read user's regular mint count
  const { data: regularMinted = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "mintedRegularPerWallet",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read user's custom mint count
  const { data: customMinted = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "mintedCustomPerWallet",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  // Read total supply
  const { data: totalSupply = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "totalSupply",
  });

  // Read max supply
  const { data: maxSupply = 0n } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "MAX_SUPPLY",
  });

  // Read paused status
  const { data: isPaused = false } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "paused",
  });

  // Calculate validation state
  const alreadyMintedRegular = regularMinted >= 1n;
  const remainingCustomMints = Number(10n - customMinted);
  const isSoldOut = maxSupply > 0n && totalSupply >= maxSupply;

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
      alert(
        "You've already minted your regular NFT (1/1). Try custom mint instead!"
      );
      return;
    }

    setMintType("regular");
    writeContract({
      address: CONTRACTS.BASEFOR,
      abi: BASEFOR_ABI,
      functionName: "mint",
    });
  };

  // Handle custom mint with payment data
  const handleCustomMint = async (payment: {
    paymentId: string;
    paymentHeader: string;
  }) => {
    // Store payment data for later settlement
    setPaymentData(payment);

    // Update mint status to "minting"
    try {
      await updateMintStatus(payment.paymentId, "minting");
    } catch (error) {
      console.error("[Home] Failed to update mint status:", error);
    }

    // Auto-wrap phrases with curly brackets for better UX
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

  // Extract token ID from transaction receipt and settle payment
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

          // Intentionally updating state with parsed blockchain event data
          // This only runs once per successful transaction, no cascading renders
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setMintedTokenId(tokenId);
          setShowModal(true);

          // Settle payment if this was a paid custom mint
          if (paymentData && mintType === "custom") {
            console.log("[Home] Settling payment after successful mint");
            try {
              await settlePayment(
                paymentData.paymentId,
                paymentData.paymentHeader,
                tokenId,
                txHash
              );
              console.log("[Home] Payment settled successfully");
            } catch (error) {
              console.error("[Home] Failed to settle payment:", error);
              // Still show success modal even if settlement fails
              // Settlement can be retried from backend
            }
          }
        }
      } catch (error) {
        console.error("Error parsing transaction logs:", error);

        // Update mint status to failed if payment was initiated
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
  }, [receipt, isSuccess, paymentData, mintType, settlePayment, updateMintStatus]);

  // Parse tokenURI to get animation_url
  useEffect(() => {
    if (!tokenURI || typeof tokenURI !== "string") return;

    try {
      const base64Data = tokenURI.split(",")[1];
      const jsonData = JSON.parse(atob(base64Data));
      if (jsonData.animation_url) {
        // Intentionally updating state with parsed NFT metadata from blockchain
        // This only runs once per tokenURI change, no cascading renders
        // eslint-disable-next-line react-hooks/set-state-in-effect
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

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-4 md:px-6 md:py-6">
        <div className="w-full max-w-7xl">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Left: Preview */}
            <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end space-y-3">
              <TokenDisplay />

              {/* Info & Share Links */}
              <div className="w-full max-w-md flex flex-wrap items-center gap-3 text-sm md:text-xs text-[#5b616e] justify-center">
                {/* OpenSea */}
                <a
                  href={`https://opensea.io/assets/base/${CONTRACTS.BASEFOR}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  title="View on OpenSea"
                >
                  <Image
                    src="/opensea_logo.svg"
                    alt="OpenSea"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </a>

                {/* OnChainChecker */}
                <a
                  href={`https://onchainchecker.xyz/collection/base/${CONTRACTS.BASEFOR}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  title="Verify on OnChainChecker"
                >
                  <Image
                    src="/onchainchecker_logo.svg"
                    alt="OnChainChecker"
                    width={20}
                    height={20}
                    className="h-5 w-5"
                  />
                </a>

                <span>|</span>

                {/* Share Buttons */}
                <a
                  href={`https://warpcast.com/~/compose?text=${encodeURIComponent(
                    "Check out What is Base for? - A fully onchain collection of base spirits 🔵"
                  )}&embeds[]=${encodeURIComponent(
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-6 w-6 items-center justify-center rounded bg-[#855DCD] transition-opacity hover:opacity-80"
                  title="Share on Farcaster"
                >
                  <Image
                    src="/farcster_new_logo.svg"
                    alt="Share on Farcaster"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 brightness-0 invert"
                  />
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    "Check out What is Base for? - A fully onchain collection of base spirits 🔵"
                  )}&url=${encodeURIComponent(
                    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-6 w-6 items-center justify-center rounded bg-black transition-opacity hover:opacity-80"
                  title="Share on X"
                >
                  <Image
                    src="/twitter_logo.svg"
                    alt="Share on X"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5 brightness-0 invert"
                  />
                </a>

                <span>|</span>

                {/* Creator */}
                <span className="text-[#0a0b0d]/80 italic">0xdasx</span>
                <a
                  href="https://warpcast.com/0xd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  title="Creator Farcaster"
                >
                  <Image
                    src="/farcster_new_logo.svg"
                    alt="Farcaster"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5"
                  />
                </a>
                <a
                  href="https://x.com/0xdasx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-opacity hover:opacity-70"
                  title="Creator X"
                >
                  <Image
                    src="/twitter_logo.svg"
                    alt="X"
                    width={14}
                    height={14}
                    className="h-3.5 w-3.5"
                  />
                </a>
              </div>
            </div>

            {/* Right: Mint Section */}
            <div className="w-full lg:w-1/2 space-y-6">
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

          {/* Success Modal */}
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
    </div>
  );
}
