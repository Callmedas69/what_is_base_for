"use client";

import { useRef, useState, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { APP_CONFIG } from "@/lib/config";

// Full color spectrum palette (40 colors spanning the rainbow)
const COLORS = [
  "#0000ff", // Deep Blue
  "#0033ff", // Blue
  "#0066ff", // Bright Blue
  "#0099ff", // Sky Blue
  "#00ccff", // Cyan
  "#00ffff", // Aqua
  "#00ffcc", // Turquoise
  "#00ff99", // Mint
  "#00ff66", // Spring Green
  "#00ff33", // Bright Green
  "#00ff00", // Lime
  "#33ff00", // Yellow Green
  "#66ff00", // Chartreuse
  "#99ff00", // Light Lime
  "#ccff00", // Lemon
  "#ffff00", // Yellow
  "#ffcc00", // Gold
  "#ff9900", // Orange
  "#ff6600", // Dark Orange
  "#ff3300", // Red Orange
  "#ff0000", // Red
  "#ff0033", // Crimson
  "#ff0066", // Deep Pink
  "#ff0099", // Hot Pink
  "#ff00cc", // Magenta
  "#ff00ff", // Fuchsia
  "#cc00ff", // Purple
  "#9900ff", // Violet
  "#6600ff", // Blue Violet
  "#3300ff", // Indigo
  "#0000ff", // Blue (cycle back)
  "#3333ff", // Periwinkle
  "#6666ff", // Light Blue
  "#9999ff", // Lavender
  "#ccccff", // Pale Blue
  "#cc99ff", // Lilac
  "#9966ff", // Purple
  "#6633ff", // Deep Purple
  "#3300cc", // Royal Purple
  "#0000cc", // Navy
];

const BAR_COUNT = 40;

// Generate bars array outside component to avoid impure function calls during render
const BARS = Array.from({ length: BAR_COUNT }, (_, i) => ({
  id: i,
  color: COLORS[i % COLORS.length],
  duration: 0.4 + Math.random() * 0.6, // 0.4s - 1.0s
  delay: Math.random() * 0.3, // 0s - 0.3s
}));

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const barsRef = useRef<HTMLDivElement[]>([]);
  const animationsRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(() => {
        // Autoplay might be blocked by browser
        setIsPlaying(false);
      });
    }
  }, []);

  // Set up GSAP animations using useGSAP hook
  useGSAP(() => {
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
        animationsRef.current.push(animation);
      }
    });
  }, []);

  // Control animations based on playing state
  useEffect(() => {
    animationsRef.current.forEach((animation) => {
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

  return (
    <>
      <audio ref={audioRef} loop>
        <source src={APP_CONFIG.AUDIO_PATH} type="audio/mpeg" />
      </audio>

      {/* Full-width equalizer above footer */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-transparent">
        <div className="relative h-16 flex items-end justify-center gap-0.5 md:gap-1 px-2 md:px-4 py-2">
          {/* Left half of equalizer bars */}
          {BARS.slice(0, BAR_COUNT / 2).map((bar, index) => (
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

          {/* Play/Pause button in the middle */}
          <button
            onClick={togglePlay}
            className="flex h-12 w-12 md:h-14 md:w-14 items-center justify-center rounded-full bg-[#ffffff] text-[#0a0b0d] shadow-xl ring-2 ring-[#0a0b0d]/10 transition-all hover:scale-110 hover:ring-4 hover:ring-[#0a0b0d]/20 self-center mx-3 md:mx-4"
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5 md:h-6 md:w-6" />
            ) : (
              <Play className="h-5 w-5 md:h-6 md:w-6" />
            )}
          </button>

          {/* Right half of equalizer bars */}
          {BARS.slice(BAR_COUNT / 2).map((bar, index) => (
            <div
              key={bar.id}
              ref={(el) => {
                if (el) barsRef.current[index + BAR_COUNT / 2] = el;
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
      </div>
    </>
  );
}
