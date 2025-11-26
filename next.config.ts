import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@onchainfi/connect"],
  turbopack: {
    resolveExtensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/farcaster-manifest",
      },
    ];
  },
};

export default nextConfig;
