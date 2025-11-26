"use client";

import { HomeContent } from "@/components/HomeContent";

/**
 * WebScreen - Wrapper for Web browser mode
 * No Farcaster SDK, uses URL-based sharing
 */
export default function WebScreen() {
  return <HomeContent isMiniApp={false} logPrefix="[Web]" />;
}
