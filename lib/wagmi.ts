/**
 * Wagmi and RainbowKit Configuration
 */

import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { baseSepolia } from "wagmi/chains";
import { RAINBOWKIT_CONFIG } from "./config";

/**
 * Wagmi Configuration
 * Uses RainbowKit's getDefaultConfig for simplified setup
 */
export const wagmiConfig = getDefaultConfig({
  appName: RAINBOWKIT_CONFIG.appName,
  projectId: RAINBOWKIT_CONFIG.projectId,
  chains: [baseSepolia],
  ssr: true, // Enable server-side rendering support
});
