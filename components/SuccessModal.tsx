"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CONTRACTS, CHAIN_CONFIG } from "@/lib/config";
import { ShareButtons } from "./ShareButtons";
import { useFarcaster } from "@/contexts/FarcasterContext";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: bigint;
  hash: `0x${string}`;
  animationUrl?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  tokenId,
  hash,
  animationUrl,
}: SuccessModalProps) {
  const { isFarcaster, isReady, actions } = useFarcaster();
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const tokenIdString = tokenId.toString();
  const contractAddress = CONTRACTS.BASEFOR;

  // URLs
  const openSeaUrl = `https://opensea.io/item/base/${contractAddress}/${tokenIdString}`;
  const txUrl = `${CHAIN_CONFIG.BASESCAN}/tx/${hash}`;
  const nftUrl = `${CHAIN_CONFIG.BASESCAN}/nft/${contractAddress}/${tokenIdString}`;
  const shareText = `What is Base for?`;

  // Handle external link clicks - use SDK in MiniApp, regular link in web
  const handleOpenUrl = async (url: string) => {
    if (isFarcaster && isReady) {
      await actions.openUrl(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-[#dee1e7] bg-white p-4">
        <div className="space-y-3">
          {/* Success Header */}
          <div className="text-center">
            <h2 className="text-lg font-semibold text-[#0a0b0d]">Minted!</h2>
            <p className="text-sm text-[#5b616e]">Token #{tokenIdString}</p>
          </div>

          {/* NFT Preview */}
          <div className="aspect-square w-40 mx-auto overflow-hidden rounded-lg border border-[#dee1e7] bg-[#eef0f3] relative">
            {animationUrl ? (
              <>
                {/* Loading placeholder */}
                {!iframeLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dee1e7] border-t-[#0000ff]" />
                  </div>
                )}
                <iframe
                  src={animationUrl}
                  className={`h-full w-full transition-opacity ${iframeLoaded ? "opacity-100" : "opacity-0"}`}
                  title={`NFT #${tokenIdString}`}
                  sandbox="allow-scripts allow-same-origin"
                  scrolling="no"
                  style={{ border: "none", overflow: "hidden" }}
                  onLoad={() => setIframeLoaded(true)}
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-center">
                <p className="text-3xl font-bold text-[#0000ff]">
                  #{tokenIdString}
                </p>
              </div>
            )}
          </div>

          {/* Token Info */}
          <div className="flex justify-between items-center">
            <Image
              src="/Base_basemark_blue.svg"
              alt="Base"
              width={80}
              height={24}
              className="h-5"
            />
            <button
              onClick={() => handleOpenUrl(txUrl)}
              className="text-xs text-[#0000ff] underline hover:text-[#3c8aff]"
              aria-label="View transaction on Basescan"
            >
              View Transaction
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleOpenUrl(openSeaUrl)}
              className="flex items-center gap-2 rounded-lg bg-[#2081e2] px-3 py-2 transition-colors hover:bg-[#2081e2]/85"
              aria-label="View on OpenSea"
            >
              <Image
                src="/opensea_logo.svg"
                alt="OpenSea"
                width={16}
                height={16}
                className="h-4 w-4"
              />
              <span className="text-xs font-medium text-white">OpenSea</span>
            </button>
            <ShareButtons
              text={shareText}
              url={nftUrl}
              imageUrl={animationUrl}
              size="sm"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-[#dee1e7] px-4 py-2 text-sm font-medium text-[#5b616e] transition-colors hover:bg-[#f5f5f5]"
          >
            Done
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
