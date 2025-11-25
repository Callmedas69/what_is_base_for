"use client";

import { useEffect, useRef, useState } from "react";
import { WalletButton } from "@onchainfi/connect";
import { APP_CONFIG } from "@/lib/config";
import { useAudio } from "@/hooks/useAudio";
import { useScrambleText } from "@/hooks/useScrambleText";

const TAGLINE = "turns words into identity, and phrases into home";

export function Header() {
  const { isPlaying, togglePlay } = useAudio();
  const { displayText: logoText, scramble: scrambleLogo } = useScrambleText(APP_CONFIG.NAME, 400);
  const { displayText: taglineText, scramble: scrambleTagline } = useScrambleText(TAGLINE, 600);
  const scrambleLogoRef = useRef(scrambleLogo);
  const scrambleTaglineRef = useRef(scrambleTagline);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Keep refs updated
  useEffect(() => {
    scrambleLogoRef.current = scrambleLogo;
    scrambleTaglineRef.current = scrambleTagline;
  }, [scrambleLogo, scrambleTagline]);

  // Sequential scramble: logo first, tagline follows
  const triggerScramble = () => {
    if (isMobile) return;
    scrambleLogoRef.current();
    setTimeout(() => scrambleTaglineRef.current(), 300);
  };

  // Auto-scramble on mount and every 7 seconds (desktop only)
  useEffect(() => {
    if (isMobile) return;
    triggerScramble();
    const interval = setInterval(triggerScramble, 7000);
    return () => clearInterval(interval);
  }, [isMobile]);

  return (
    <header className="relative z-10 flex flex-row items-center justify-between gap-4 border-b border-[#dee1e7] bg-white px-4 sm:px-6 py-4">
      {/* Left: Logo */}
      <div className="flex flex-col gap-1 cursor-pointer" onMouseEnter={triggerScramble} onClick={triggerScramble}>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0a0b0d] tracking-tight">
          {logoText}
        </h1>
        <p className="hidden sm:block text-base lg:text-sm text-[#5b616e] font-mono font-extrabold uppercase leading-tight">
          {taglineText}
        </p>
      </div>

      {/* Center: Play Button */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#dee1e7] bg-white hover:bg-gray-50 transition-colors"
      >
        <span className="text-lg">{isPlaying ? "⏸" : "▶"}</span>
        <span className="hidden sm:inline text-sm font-medium text-[#0a0b0d]">
          {isPlaying ? "Pause" : "Play Music"}
        </span>
      </button>

      {/* Right: Wallet */}
      <div className="wallet-button-container">
        <WalletButton position="inline" />
      </div>
    </header>
  );
}
