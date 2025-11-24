"use client";

import { useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { APP_CONFIG } from "@/lib/config";

// Full color spectrum with hard stops (40 colors, 2.5% each)
const HARD_STOP_GRADIENT = `linear-gradient(
  90deg,
  #0000ff 0% 2.5%, #0033ff 2.5% 5%, #0066ff 5% 7.5%, #0099ff 7.5% 10%,
  #00ccff 10% 12.5%, #00ffff 12.5% 15%, #00ffcc 15% 17.5%, #00ff99 17.5% 20%,
  #00ff66 20% 22.5%, #00ff33 22.5% 25%, #00ff00 25% 27.5%, #33ff00 27.5% 30%,
  #66ff00 30% 32.5%, #99ff00 32.5% 35%, #ccff00 35% 37.5%, #ffff00 37.5% 40%,
  #ffcc00 40% 42.5%, #ff9900 42.5% 45%, #ff6600 45% 47.5%, #ff3300 47.5% 50%,
  #ff0000 50% 52.5%, #ff0033 52.5% 55%, #ff0066 55% 57.5%, #ff0099 57.5% 60%,
  #ff00cc 60% 62.5%, #ff00ff 62.5% 65%, #cc00ff 65% 67.5%, #9900ff 67.5% 70%,
  #6600ff 70% 72.5%, #3300ff 72.5% 75%, #0000ff 75% 77.5%, #3333ff 77.5% 80%,
  #6666ff 80% 82.5%, #9999ff 82.5% 85%, #ccccff 85% 87.5%, #cc99ff 87.5% 90%,
  #9966ff 90% 92.5%, #6633ff 92.5% 95%, #3300cc 95% 97.5%, #0000cc 97.5% 100%
)`;

export function Header() {
  const logoRef = useRef<HTMLHeadingElement>(null);
  const animationRef = useRef<gsap.core.Tween | null>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  // Set up GSAP context using useGSAP hook
  useGSAP(() => {
    contextRef.current = gsap.context(() => {
      // Context is ready for animations
    });

    return () => {
      // Cleanup on unmount
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  const handleMouseEnter = () => {
    if (logoRef.current) {
      // Set hard-stop gradient background
      logoRef.current.style.background = HARD_STOP_GRADIENT;
      logoRef.current.style.backgroundSize = "200% 100%";
      logoRef.current.style.backgroundClip = "text";
      logoRef.current.style.webkitBackgroundClip = "text";
      logoRef.current.style.color = "transparent";
      logoRef.current.style.backgroundPosition = "0% 0%";
      // Add grey border/stroke to each color
      logoRef.current.style.webkitTextStroke = "1px #717886";

      // Animate gradient position infinitely within GSAP context
      if (animationRef.current) {
        animationRef.current.kill();
      }

      animationRef.current = gsap.to(logoRef.current, {
        backgroundPosition: "200% 0%",
        duration: 2,
        ease: "none",
        repeat: -1,
      });
    }
  };

  const handleMouseLeave = () => {
    if (logoRef.current && animationRef.current) {
      // Kill animation
      animationRef.current.kill();
      animationRef.current = null;

      // Reset to black text
      logoRef.current.style.background = "none";
      logoRef.current.style.color = "#0a0b0d";
      logoRef.current.style.webkitTextStroke = "";
    }
  };

  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 border-b border-[#dee1e7] bg-white px-4 sm:px-6 py-4">
      <div className="flex flex-col gap-1">
        <h1
          ref={logoRef}
          className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0a0b0d] tracking-tight cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {APP_CONFIG.NAME}
        </h1>
        <p className="hidden sm:block text-base lg:text-lg text-[#5b616e] font-mono font-extrabold uppercase leading-tight">
          turns words into identity, and phrases into home
        </p>
      </div>
      <ConnectButton />
    </header>
  );
}
