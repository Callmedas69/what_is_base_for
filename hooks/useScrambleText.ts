"use client";

import { useState, useCallback, useRef, useEffect } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

export function useScrambleText(originalText: string, duration = 600) {
  const [displayText, setDisplayText] = useState(originalText);
  const isAnimatingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const scramble = useCallback(() => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const iterations = 10;
    const intervalTime = duration / iterations;
    let count = 0;

    intervalRef.current = setInterval(() => {
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
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setDisplayText(originalText);
        isAnimatingRef.current = false;
      }
    }, intervalTime);
  }, [originalText, duration]);

  return { displayText, scramble };
}
