"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";
import { CustomWalletConnect } from "@/components/wallet/CustomWalletConnect";
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
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth < 640;
  });

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
    scrambleLogoRef.current();
    setTimeout(() => scrambleTaglineRef.current(), 300);
  };

  // Auto-scramble on mount and every 7 seconds
  useEffect(() => {
    triggerScramble();
    const interval = setInterval(triggerScramble, 7000);
    return () => clearInterval(interval);
  }, [isMobile]);

  return (
    <header className="relative z-10 flex flex-row items-center justify-between gap-4 border-b border-[#dee1e7] bg-white px-4 sm:px-6 py-4 h-[72px] sm:h-[80px]">
      {/* Left: Logo - min-w prevents shifting during scramble */}
      <div className="flex flex-col gap-1 cursor-pointer min-w-[100px] sm:min-w-[140px]" onMouseEnter={triggerScramble} onClick={triggerScramble}>
        <h1 className="text-2xl sm:text-2xl lg:text-3xl font-extrabold text-[#0a0b0d] tracking-tight">
          {logoText}
        </h1>
        <p className="text-xs sm:block lg:text-sm text-[#5b616e] font-mono font-extrabold uppercase leading-tight">
          {taglineText}
        </p>
      </div>

      {/* Center: Play Button */}
      <button
        onClick={togglePlay}
        className="flex items-center gap-2 px-2 py-2 rounded-full border border-[#dee1e7] bg-white hover:bg-gray-50 transition-colors"
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        <span className="hidden sm:inline text-sm font-medium text-[#0a0b0d]">
          {isPlaying ? "Pause" : "Play"}
        </span>
      </button>

      {/* Right: Wallet */}
      <CustomWalletConnect className="p-2 text-[#0a0b0d] hover:text-gray-600 transition" />
    </header>
  );
}
