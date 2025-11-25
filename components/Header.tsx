"use client";

import { useRef, useState, useEffect } from "react";
import { WalletButton } from "@onchainfi/connect";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { APP_CONFIG } from "@/lib/config";

// Full color spectrum palette (40 colors spanning the rainbow)
const COLORS = [
  "#0000ff", "#0033ff", "#0066ff", "#0099ff", "#00ccff",
  "#00ffff", "#00ffcc", "#00ff99", "#00ff66", "#00ff33",
  "#00ff00", "#33ff00", "#66ff00", "#99ff00", "#ccff00",
  "#ffff00", "#ffcc00", "#ff9900", "#ff6600", "#ff3300",
  "#ff0000", "#ff0033", "#ff0066", "#ff0099", "#ff00cc",
  "#ff00ff", "#cc00ff", "#9900ff", "#6600ff", "#3300ff",
  "#0000ff", "#3333ff", "#6666ff", "#9999ff", "#ccccff",
  "#cc99ff", "#9966ff", "#6633ff", "#3300cc", "#0000cc",
];

const BAR_COUNT = 40;

// Generate bars array outside component
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  duration: 0.4 + Math.random() * 0.6,
  delay: Math.random() * 0.3,
}));

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

  // Audio state
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const barAnimationsRef = useRef<gsap.core.Tween[]>([]);

  // Auto-play audio on mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, []);

  // Set up GSAP context for logo animation
  useGSAP(() => {
    contextRef.current = gsap.context(() => {});
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
    };
  }, []);

  // Animate spectrum bars after mount
  useEffect(() => {
    // Clear previous animations
    barAnimationsRef.current.forEach((anim) => anim.kill());
    barAnimationsRef.current = [];

    // Create new animations
    barsRef.current.forEach((bar, index) => {
      if (bar) {
        const barData = BARS[index];
        const animation = gsap.to(bar, {
          height: "90%",
          duration: barData.duration,
          ease: "power1.inOut",
          yoyo: true,
          repeat: -1,
          delay: barData.delay,
        });
        barAnimationsRef.current.push(animation);
      }
    });

    return () => {
      barAnimationsRef.current.forEach((anim) => anim.kill());
    };
  }, []);

  // Control bar animations based on playing state
  useEffect(() => {
    barAnimationsRef.current.forEach((animation) => {
      if (isPlaying) {
        animation.play();
      } else {
        animation.pause();
      }
    });
  }, [isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

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
    <>
      <audio ref={audioRef} loop>
        <source src={APP_CONFIG.AUDIO_PATH} type="audio/mpeg" />
      </audio>

      {/* Top Audio Visualizer - bars grow downward from top */}
      <div
        className="w-full h-8 flex items-start justify-center gap-0.5 cursor-pointer bg-white"
        onClick={togglePlay}
      >
        {BARS.map((bar, index) => (
          <div
            key={bar.id}
            ref={(el) => {
              if (el) barsRef.current[index] = el;
            }}
            className={`flex-1 transition-opacity ${
              isPlaying ? "opacity-100" : "opacity-30"
            } ${index % 2 === 0 ? "" : "hidden md:block"}`}
            style={{
              backgroundColor: bar.color,
              height: "20%",
            }}
          />
        ))}
      </div>

      <header className="flex flex-row items-center justify-between gap-4 border-b border-[#dee1e7] bg-white px-4 sm:px-6 py-4">
        <div className="flex flex-col gap-1">
          <h1
            ref={logoRef}
            className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#0a0b0d] tracking-tight cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {APP_CONFIG.NAME}
          </h1>
          <p className="hidden sm:block text-base lg:text-sm text-[#5b616e] font-mono font-extrabold uppercase leading-tight">
            turns words into identity, and phrases into home
          </p>
        </div>

        <div className="wallet-button-container">
          <WalletButton position="inline" />
        </div>
      </header>
    </>
  );
}
