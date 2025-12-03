"use client";

import { createContext, useContext, useRef, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { APP_CONFIG } from "@/lib/config";

interface AudioContextType {
  isPlaying: boolean;
  togglePlay: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

export function AudioProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Initialize audio element on mount
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio(APP_CONFIG.AUDIO_PATH);
      audio.loop = true;
      audioRef.current = audio;

      // Try auto-play (browsers may block this)
      audio.play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  }, [isPlaying]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({ isPlaying, togglePlay }),
    [isPlaying, togglePlay]
  );

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within AudioProvider");
  }
  return context;
}
