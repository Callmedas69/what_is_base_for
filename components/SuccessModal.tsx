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
      <DialogContent className="max-w-sm border-[#dee1e7] bg-white p-4">
        <div className="space-y-3">
          {/* NFT Preview */}
          <div className="aspect-square w-40 mx-auto overflow-hidden rounded-lg border border-[#dee1e7] bg-[#eef0f3]">
            {animationUrl ? (
              <iframe
                src={animationUrl}
                className="h-full w-full"
                title={`NFT #${tokenIdString}`}
                sandbox="allow-scripts allow-same-origin"
                scrolling="no"
                style={{ border: "none", overflow: "hidden" }}
              />
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
            <a
              href={`${CHAIN_CONFIG.BASESCAN}/tx/${hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#0000ff] underline hover:text-[#3c8aff]"
            >
              View Transaction
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-2">
            <a
              href={openSeaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-[#2081e2] px-3 py-2 transition-colors hover:bg-[#2081e2]/85"
              title="View on OpenSea"
            >
              <Image
                src="/opensea_logo.svg"
                alt="OpenSea"
                width={16}
                height={16}
                className="h-4 w-4"
              />
              <span className="text-xs font-medium text-white">OpenSea</span>
            </a>
            <ShareButtons
              text={shareText}
              url={nftUrl}
              imageUrl={animationUrl}
              size="sm"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
