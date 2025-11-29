"use client";

import { useEffect, useRef, useState } from "react";
import { useReadContract } from "wagmi";
import { WHATISBASEFOR_ABI } from "@/abi/WhatIsBaseFor.abi";
import { APP_CONFIG, CONTRACTS } from "@/lib/config";

const ORIGINAL_SIZE = 512; // Original NFT resolution

export function TokenDisplay() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const { data: tokenURI, error, isLoading } = useReadContract({
    address: CONTRACTS.WHATISBASEFOR,
    abi: WHATISBASEFOR_ABI,
    functionName: "tokenURI",
    args: [BigInt(APP_CONFIG.TOKEN_DISPLAY_ID)],
  });

  // Log errors for debugging
  useEffect(() => {
    if (error) {
      console.log('[TokenDisplay] Token #0 not found - this is expected if no tokens have been minted yet');
    }
  }, [error]);

  // Parse tokenURI and decode animation_url (SVG)
  useEffect(() => {
    if (!tokenURI) return;

    try {
      // tokenURI is base64 encoded JSON
      const base64Data = tokenURI.split(",")[1];
      const jsonData = JSON.parse(atob(base64Data));

      // Decode base64 SVG from animation_url
      if (jsonData.animation_url?.startsWith("data:image/svg+xml;base64,")) {
        const svgContent = atob(jsonData.animation_url.split(",")[1]);
        // Wrap SVG in HTML for iframe display
        const htmlWrapper = `<!DOCTYPE html>
<html><head><style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff;}</style></head>
<body>${svgContent}</body></html>`;
        setHtml(htmlWrapper);
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
              {isLoading ? (
                <p className="text-sm text-[#5b616e]">Loading animation...</p>
              ) : error ? (
                <div className="space-y-2">
                  <p className="text-sm text-[#5b616e]">Token not minted yet</p>
                  <p className="text-xs text-[#8b91a0]">
                    Mint your first NFT to see it here!
                  </p>
                </div>
              ) : (
                <p className="text-sm text-[#5b616e]">Loading animation...</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
