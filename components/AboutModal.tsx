"use client";

import Image from "next/image";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-xs border-[#dee1e7] bg-white p-4 sm:max-w-sm">
        <DialogTitle className="sr-only">About</DialogTitle>
        <DialogDescription className="sr-only">
          Project information and features
        </DialogDescription>
        <div className="space-y-4">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-lg font-bold text-[#0a0b0d]">What is Base For?</h2>
          </div>

          {/* Description */}
          <p className="text-sm text-[#5b616e] text-center leading-relaxed">
            A generative art project exploring what Base means to its community.
            Each NFT captures unique perspectives through randomly combined phrases.
            An experiment in traits micro payment.
          </p>

          {/* Features */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[#0000ff] text-[8px]">●</span>
              <span className="text-xs text-[#5b616e]">Fully onchain</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0000ff] text-[8px]">●</span>
              <span className="text-xs text-[#5b616e]">Animated SVG</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0000ff] text-[8px]">●</span>
              <span className="text-xs text-[#5b616e]">Interactive background</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0000ff] text-[8px]">●</span>
              <span className="text-xs text-[#5b616e]">Custom traits (phrases)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0000ff] text-[8px]">●</span>
              <span className="text-xs text-[#5b616e]">OnchainFi x402 smart payment</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0000ff] text-[8px]">●</span>
              <span className="text-xs text-[#5b616e]">Payment safety</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#0000ff] text-[8px]">●</span>
              <span className="text-xs text-[#5b616e]">Hybrid website + MiniApp</span>
            </div>
          </div>

          {/* Built on Base */}
          <div className="flex items-center justify-center gap-2 pt-2">
            <Image
              src="/Base_basemark_blue.svg"
              alt="Base"
              width={48}
              height={16}
              className="h-4 w-auto"
              unoptimized
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
