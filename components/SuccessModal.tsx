"use client";

import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CONTRACTS, CHAIN_CONFIG } from "@/lib/config";
import { ShareButtons } from "./ShareButtons";

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
  const tokenIdString = tokenId.toString();
  const contractAddress = CONTRACTS.BASEFOR;

  // Social share URLs
  const openSeaUrl = `https://opensea.io/item/base/${contractAddress}/${tokenIdString}`;

  const shareText = `What is Base for? 🟦`;
  const nftUrl = `${CHAIN_CONFIG.BASESCAN}/nft/${contractAddress}/${tokenIdString}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md border-[#dee1e7] bg-white max-h-[90vh] overflow-y-auto">
        <div className="space-y-4 sm:space-y-6">
          {/* NFT Preview */}
          <div className="aspect-square w-full overflow-hidden rounded-lg border-2 border-[#dee1e7] bg-[#eef0f3]">
            {animationUrl ? (
              <iframe
                src={animationUrl}
                className="h-full w-full"
                title={`NFT #${tokenIdString}`}
                sandbox="allow-scripts allow-same-origin"
                scrolling="no"
                style={{
                  border: "none",
                  overflow: "hidden",
                }}
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center">
                <div className="space-y-4">
                  <p className="text-4xl sm:text-6xl font-bold text-[#0000ff]">
                    #{tokenIdString}
                  </p>
                  <p className="text-sm text-[#5b616e]">
                    On-chain animated NFT
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Token Info */}
          <div className="space-y-2 text-center flex flex-col sm:flex-row justify-between items-center gap-3">
            <Image
              src="/Base_basemark_blue.svg"
              alt="Base"
              width={100}
              height={32}
              className="h-6"
            />
            <a
              href={`${CHAIN_CONFIG.BASESCAN}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#0000ff] underline hover:text-[#3c8aff]"
            >
              View Transaction
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
            {/* OpenSea Button */}
            <a
              href={openSeaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-[#2081e2] px-4 py-3 sm:py-2.5 transition-colors hover:bg-[#2081e2]/85"
              title="View on OpenSea"
            >
              <Image
                src="/opensea_logo.svg"
                alt="OpenSea"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="text-sm font-medium text-white">
                View on OpenSea
              </span>
            </a>

            {/* Share Buttons */}
            <ShareButtons
              text={shareText}
              url={nftUrl}
              imageUrl={animationUrl}
              size="md"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
