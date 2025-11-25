"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useAudio } from "@/hooks/useAudio";

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

export function AudioVisualizer() {
  const { isPlaying } = useAudio();
  const barsRef = useRef<HTMLDivElement[]>([]);
  const barAnimationsRef = useRef<gsap.core.Tween[]>([]);

  // Animate spectrum bars after mount
  useEffect(() => {
    // Clear previous animations
    barAnimationsRef.current.forEach((anim) => anim.kill());
    barAnimationsRef.current = [];

    // Create new animations
    barsRef.current.forEach((bar, index) => {
      if (bar) {
        const barData = BARS[index];
        const animation = gsap.fromTo(bar,
          { height: "20%" },
          {
            height: "100%",
            duration: barData.duration,
            ease: "power1.inOut",
            yoyo: true,
            repeat: -1,
            delay: barData.delay,
            paused: true,
          }
        );
        barAnimationsRef.current.push(animation);
      }
    });

    return () => {
      barAnimationsRef.current.forEach((anim) => anim.kill());
    };
  }, []);

  // Control bar animations based on playing state
  useEffect(() => {
    barAnimationsRef.current.forEach((animation, index) => {
      if (isPlaying) {
        animation.invalidate();
        animation.restart();
      } else {
        animation.pause();
        if (barsRef.current[index]) {
          gsap.to(barsRef.current[index], {
            height: "0%",
            duration: 1.2,
            ease: "power3.out",
            delay: index * 0.012,
          });
        }
      }
    });
  }, [isPlaying]);

  return (
    <div className="absolute w-full h-[25vh] flex items-start justify-center gap-0.5 bg-transparent z-0">
      {BARS.map((bar, index) => (
        <div
          key={bar.id}
          ref={(el) => {
            if (el) barsRef.current[index] = el;
          }}
          className={`flex-1 ${index % 2 === 0 ? "" : "hidden md:block"}`}
          style={{
            backgroundColor: bar.color,
            height: "0%",
            opacity: 0.1,
          }}
        />
      ))}
    </div>
  );
}
