"use client";

import { useState, useCallback, useRef } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function useScrambleText(originalText: string, duration = 600) {
  const [displayText, setDisplayText] = useState(originalText);
  const isAnimatingRef = useRef(false);

  const scramble = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    const iterations = 10;
    const intervalTime = duration / iterations;
    let count = 0;

    const interval = setInterval(() => {
      setDisplayText(
        originalText
          .split("")
          .map((char, i) => {
            if (char === " ") return " ";
            // Progressively reveal characters from left to right
            if (i < (count / iterations) * originalText.length) {
              return originalText[i];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      count++;
      if (count > iterations) {
        clearInterval(interval);
        setDisplayText(originalText);
        isAnimatingRef.current = false;
      }
    }, intervalTime);
  }, [originalText, duration]);

  return { displayText, scramble };
}
