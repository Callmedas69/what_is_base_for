"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { CONTRACTS, CHAIN_CONFIG } from "@/lib/config";
import { ShareButtons } from "./ShareButtons";
import { useFarcaster } from "@/contexts/FarcasterContext";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: bigint;
  hash: `0x${string}`;
  imageUrl?: string;
}

export function SuccessModal({
  isOpen,
  onClose,
  tokenId,
  hash,
  imageUrl,
}: SuccessModalProps) {
  const { isFarcaster, isReady, actions } = useFarcaster();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Decode SVG for iframe display (animated SVG support)
  const svgHtml = useMemo(() => {
    if (!imageUrl?.startsWith("data:image/svg+xml;base64,")) return null;
    try {
      const svgContent = atob(imageUrl.split(",")[1]);
      return `<!DOCTYPE html><html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;}</style></head><body>${svgContent}</body></html>`;
    } catch {
      return null;
    }
  }, [imageUrl]);

  const tokenIdString = tokenId.toString();
  const contractAddress = CONTRACTS.BASEFOR;

  // URLs
  const openSeaUrl = `https://opensea.io/assets/base/${contractAddress}/${tokenIdString}`;
  const txUrl = `${CHAIN_CONFIG.BASESCAN}/tx/${hash}`;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://basefor.geoart.studio";
  const shareText = `What is Base for?`;

  // Handle external link clicks - use SDK in MiniApp, regular link in web
  const handleOpenUrl = async (url: string) => {
    if (isFarcaster && isReady) {
      await actions.openUrl(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const showFallback = !imageUrl || imageError || (!svgHtml && !imageUrl);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xs border-[#dee1e7] bg-white p-4 sm:max-w-sm">
        <DialogTitle className="sr-only">Mint Success</DialogTitle>
        <div className="space-y-3">
          {/* Success Header */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-[#0a0b0d]">Minted!</h2>
            <p className="text-xs text-[#5b616e]">Token #{tokenIdString}</p>
          </div>

          {/* NFT Preview */}
          <div className="w-full overflow-hidden rounded-lg border border-[#dee1e7] bg-white relative">
            {showFallback ? (
              <div className="flex aspect-square flex-col items-center justify-center p-3">
                <span className="text-3xl font-bold text-[#0000ff]">#{tokenIdString}</span>
                <span className="mt-1 text-xs text-[#5b616e]">BaseFor NFT</span>
              </div>
            ) : svgHtml ? (
              <iframe
                srcDoc={svgHtml}
                title={`NFT #${tokenIdString}`}
                sandbox="allow-scripts allow-same-origin"
                className="aspect-square w-full border-none"
              />
            ) : (
              <>
                {!imageLoaded && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#f9fafb]">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#dee1e7] border-t-[#0000ff]" />
                  </div>
                )}
                <Image
                  src={imageUrl!}
                  alt={`NFT #${tokenIdString}`}
                  width={400}
                  height={400}
                  className={`w-full h-auto transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  unoptimized
                />
              </>
            )}
          </div>

          {/* Links */}
          <div className="flex justify-center gap-4 text-xs">
            <button
              onClick={() => handleOpenUrl(txUrl)}
              className="text-[#0000ff] hover:underline italic"
            >
              View Transaction
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleOpenUrl(openSeaUrl)}
              className="flex h-10 items-center gap-2 rounded-lg bg-[#2081e2] px-4 transition-colors hover:bg-[#1868b7]"
            >
              <Image
                src="/opensea_logo.svg"
                alt="OpenSea"
                width={18}
                height={18}
                className="h-[18px] w-[18px]"
              />
              <span className="text-sm font-medium text-white">OpenSea</span>
            </button>
            <ShareButtons
              text={shareText}
              url={appUrl}
              imageUrl={imageUrl}
              size="sm"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
