"use client";

import { HomeContent } from "@/components/HomeContent";

/**
 * WebScreen - Wrapper for Web browser mode
 * No Farcaster SDK, shows Farcaster share button
 */
export default function WebScreen() {
  return <HomeContent hideFarcasterShare={false} logPrefix="[Web]" />;
}
