"use client";

import { useEffect, useRef, useState } from "react";
import { useReadContract } from "wagmi";
import { BASEFOR_ABI } from "@/abi/Basefor.abi";
import { APP_CONFIG, CONTRACTS } from "@/lib/config";

const ORIGINAL_SIZE = 512; // Original NFT resolution

export function TokenDisplay() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const { data: tokenURI } = useReadContract({
    address: CONTRACTS.BASEFOR,
    abi: BASEFOR_ABI,
    functionName: "tokenURI",
    args: [BigInt(APP_CONFIG.TOKEN_DISPLAY_ID)],
  });

  // Parse tokenURI and decode base64 HTML
  useEffect(() => {
    if (!tokenURI) return;

    try {
      // tokenURI is base64 encoded JSON
      const base64Data = tokenURI.split(",")[1];
      const jsonData = JSON.parse(atob(base64Data));

      // Decode base64 HTML from animation_url
      if (jsonData.animation_url?.startsWith("data:text/html;base64,")) {
        const htmlContent = atob(jsonData.animation_url.split(",")[1]);
        setHtml(htmlContent);
      }
    } catch (error) {
      console.error("Error parsing tokenURI:", error);
    }
  }, [tokenURI]);

  // Handle responsive scaling
  useEffect(() => {
    const resizeListener = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const newScale = Math.min(
        rect.width / ORIGINAL_SIZE,
        rect.height / ORIGINAL_SIZE
      );
      setScale(newScale);
    };

    resizeListener();
    window.addEventListener("resize", resizeListener);
    return () => window.removeEventListener("resize", resizeListener);
  }, []);

  return (
    <div className="w-full max-w-md">
      <div
        ref={containerRef}
        className="aspect-square w-full overflow-hidden rounded-lg border-2 border-[#dee1e7] bg-[#eef0f3]"
        style={{
          position: "relative",
        }}
      >
        {html ? (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            title={`NFT #${APP_CONFIG.TOKEN_DISPLAY_ID}`}
            sandbox="allow-scripts allow-same-origin"
            style={{
              width: ORIGINAL_SIZE,
              height: ORIGINAL_SIZE,
              border: "none",
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
        ) : (
          <div className="flex h-full items-center justify-center p-8 text-center">
            <div className="space-y-4">
              <p className="text-6xl font-bold text-[#0000ff]">
                #{APP_CONFIG.TOKEN_DISPLAY_ID}
              </p>
              <p className="text-sm text-[#5b616e]">Loading animation...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
